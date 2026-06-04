require("dotenv").config();
const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const qrcode = require("qrcode-terminal");

const { ownerNumber, authFolder } = require("./config");
const { handleMessages } = require("./lib/commandHandler");

let isFirstConnect = true;
let isReconnecting = false;

    const fs = require("fs");
    const path = require("path");

    // 📦 SESSION ID AUTO-RESTORE
    if (process.env.SESSION_ID && !fs.existsSync(path.join(__dirname, authFolder, "creds.json"))) {
        console.log("📦 SESSION_ID found in .env. Attempting to restore session...");
        try {
            const sessionId = process.env.SESSION_ID.replace("Nexus~", "");
            const credsJson = Buffer.from(sessionId, "base64").toString("utf-8");
            
            if (!fs.existsSync(path.join(__dirname, authFolder))) {
                fs.mkdirSync(path.join(__dirname, authFolder), { recursive: true });
            }
            
            fs.writeFileSync(path.join(__dirname, authFolder, "creds.json"), credsJson);
            console.log("✅ Session restored successfully from SESSION_ID!");
        } catch (e) {
            console.error("❌ Failed to restore session from ID:", e.message);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        markOnline: true, // Try to keep connection alive
        browser: ["Nexus-1MD", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.clear();
            console.log("📲 Scan this QR to login:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            isReconnecting = false;
            console.log("✅ Bot connected and stable!");
            
            // 📊 Initialize Database Settings & Cache
            const { initSettingsDB } = require("./database/settings");
            const { initWarningDB } = require("./database/warnings");
            const { initRulesDB } = require("./database/rules");
            const { initBadwordDB } = require("./database/badwords");
            const { loadSettings } = require("./lib/settings");
            await initSettingsDB();
            await initWarningDB();
            await initRulesDB();
            await initBadwordDB();
            await loadSettings(); 

            // Save our own JID for self-management logic
            // 🚀 SMART CAPTURE: Look for LID first as it's the most common 'fromMe' ID
            const myJid = sock.authState.creds.me.lid || sock.authState.creds.me.id || sock.user.id;
            global.myJid = myJid.includes(":") ? myJid.split(":")[0] + "@s.whatsapp.net" : (myJid.includes("@") ? myJid : myJid + "@s.whatsapp.net");
            
            console.log(`📊 Unified settings loaded. SELF-ID DETECTED: ${global.myJid}`);

            if (isFirstConnect) {
                const { toJid } = require("./lib/utils");
                isFirstConnect = false;
                console.log("🚀 Sending initial online notification...");
                const primaryOwner = toJid(require("./config").ownerNumbers[0]);
                await sock.sendMessage(primaryOwner, { text: "🤖 Bot is now online! (v1.0.0)" });
            }

            // 🛠️ Scheduled Maintenance (Every 24 hours)
            setInterval(async () => {
                const { MessageLog } = require("./lib/messageModel");
                const { Op } = require("sequelize");
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                try {
                    const deleted = await MessageLog.destroy({
                        where: { timestamp: { [Op.lt]: sevenDaysAgo } }
                    });
                    console.log(`🧹 Database Maintenance: Cleaned ${deleted} old message logs.`);
                } catch (e) {
                    console.error("Maintenance Error:", e);
                }
            }, 24 * 60 * 60 * 1000);
        }
// ... rest of connection logic ...

        if (connection === "close") {
            isReconnecting = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            const reason = lastDisconnect?.error?.message || "Unknown error";
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log(`🔌 DISCONNECTED! Code: ${statusCode} | Reason: ${reason}`);

                // Softer conflict handling for debugging
                if (statusCode === 440 || reason.includes("conflict")) {
                    console.warn("⚠️ CONNECTION CONFLICT DETECTED. If this persists, close other bot windows.");
                    // process.exit(1); // Temporarily disabled for your testing
                }

                if (!isReconnecting) {
                    isReconnecting = true;
                    const delay = 10000; // Increased to 10s for stability
                    console.log(`⏳ Reconnecting in ${delay / 1000}s...`);
                    setTimeout(() => {
                        isReconnecting = false;
                        connectionLogic();
                    }, delay);
                }
            } else {
                console.log("🔌 Connection closed. Not reconnecting.");
            }
        }
    });

    // 🛡️ Automation & Command Handling
    const { handleAutomation } = require("./lib/automation");
    sock.ev.on("messages.upsert", async (upsert) => {
        const m = upsert.messages[0];
        if (!m.message) return;

        // 🛡️ ROBUST SENDER DETECTION
        const sender = m.key.remoteJidAlt || m.key.participant || m.key.remoteJid;
        const cleanSender = (sender || "").replace(/[^0-9]/g, "");
        const { isOwner } = require("./lib/middleware");
        const isOwnerStatus = isOwner(sender);

        // 🛡️ USER REQUESTED DIAGNOSTICS
        const body = (m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || "");
        console.log("-----------------------------------------");
        console.log(JSON.stringify(m.key, null, 2));
        console.log("Sender:", sender);
        console.log("FromMe:", m.key.fromMe);
        console.log("IsOwner:", isOwnerStatus);
        console.log("Body:", body);
        console.log("-----------------------------------------");

        // allow owner even if fromMe
        if (m.key.fromMe && !isOwnerStatus) return;

        // 1. Background Automation (Anti-Delete, Status, logging)
        await handleAutomation(sock, m);

        // 2. Command Execution (Menu, Ping, etc.)
        await handleMessages(sock, upsert); 
    });

    // 🚪 Group Events (Welcome/Goodbye)
    sock.ev.on("group-participants.update", async (update) => {
        const { id, participants, action } = update;
        const { getSettings } = require("./lib/settings");
        const settings = getSettings();

        if (action === "add" && settings.welcome) {
            for (let user of participants) {
                try {
                    const metadata = await sock.groupMetadata(id);
                    let msg = settings.welcomeMsg
                        .replace("@user", `@${user.split("@")[0]}`)
                        .replace("@group", metadata.subject);
                    
                    await sock.sendMessage(id, { text: msg, mentions: [user] });
                } catch (e) {
                    console.error("Welcome Error:", e);
                }
            }
        } else if (action === "remove" && settings.goodbye) {
            for (let user of participants) {
                try {
                    const metadata = await sock.groupMetadata(id);
                    let msg = settings.goodbyeMsg
                        .replace("@user", `@${user.split("@")[0]}`)
                        .replace("@group", metadata.subject);
                    
                    await sock.sendMessage(id, { text: msg, mentions: [user] });
                } catch (e) {
                    console.error("Goodbye Error:", e);
                }
            }
        }
    });

    // 📞 Anti-Call
    sock.ev.on("call", async (calls) => {
        const { getSettings } = require("./lib/settings");
        if (getSettings().antiCall) {
            for (const call of calls) {
                if (call.status === "offer") {
                    console.log(`📞 Rejecting call from: ${call.from}`);
                    await sock.rejectCall(call.id, call.from);
                }
            }
        }
    });
}

connectionLogic();