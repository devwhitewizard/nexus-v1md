const envResult = require("dotenv").config();
if (envResult.error) {
    console.log("⚠️  Could not find .env file. Using system environment variables instead.");
} else {
    console.log("✅ .env file loaded successfully.");
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const qrcode = require("qrcode-terminal");
const zlib = require("zlib");

const { authFolder } = require("./config");
const { handleMessages } = require("./lib/commandHandler");

let isFirstConnect = true;
let isReconnecting = false;

async function connectionLogic() {
    if (isReconnecting) return;
    isReconnecting = true;

    const fs = require("fs");
    const path = require("path");

    // 📦 SESSION ID AUTO-RESTORE
    if (process.env.SESSION_ID) {
        console.log("📦 SESSION_ID detected. Verifying session file...");
        const credsPath = path.join(__dirname, authFolder, "creds.json");
        
        // If SESSION_ID is present, we always ensure the file matches it
        // This fixes cases where a broken/partially scan-created file exists
        console.log("📦 SESSION_ID found in .env. Attempting to restore session...");
        try {
            const rawId = process.env.SESSION_ID.trim();
            const sessionId = rawId.includes("~") ? rawId.split("~")[1] : (rawId.startsWith("BWM") || rawId.startsWith("XMD") ? rawId.slice(4) : rawId);
            const buffer = Buffer.from(sessionId, "base64");
            
            let credsJson = "";
            
            // 1. Try Gzip/Deflate Decompression
            try {
                credsJson = zlib.gunzipSync(buffer).toString("utf-8");
            } catch (e) {
                try {
                    credsJson = zlib.inflateSync(buffer).toString("utf-8");
                } catch (e2) {
                    credsJson = buffer.toString("utf-8");
                }
            }

            // 2. Smart Binary Search & Validation
            console.log(`📦 Decoded SESSION_ID (Buffer Length: ${buffer.length})`);

            const extractValidJsonFromBuffer = (buf) => {
                const start = buf.indexOf(Buffer.from("{"));
                if (start === -1) return null;
                
                // Try to find a valid JSON from each { occurrence
                for (let i = start; i < buf.length; i++) {
                    if (buf[i] === 123) { // 123 is '{'
                        try {
                            const segment = buf.slice(i).toString("utf-8");
                            // Simple validation: look for "creds" or "noiseKey" which are standard in Baileys
                            if (segment.includes("noiseKey") || segment.includes("advSecretKey")) {
                                JSON.parse(segment.substring(0, segment.lastIndexOf("}") + 1));
                                return segment.substring(0, segment.lastIndexOf("}") + 1);
                            }
                        } catch (err) {
                            // try next {
                        }
                    }
                }
                return null;
            };

            const finalJson = extractValidJsonFromBuffer(buffer) || (credsJson.includes("{") ? credsJson.substring(credsJson.indexOf("{")) : null);

            if (!fs.existsSync(path.join(__dirname, authFolder))) {
                fs.mkdirSync(path.join(__dirname, authFolder), { recursive: true });
            }

            if (finalJson) {
                console.log("✅ Valid JSON Session found and verified.");
                fs.writeFileSync(path.join(__dirname, authFolder, "creds.json"), finalJson);
            } else {
                console.error("❌ Error: Could not find valid JSON in Session ID.");
                fs.writeFileSync(path.join(__dirname, authFolder, "creds.json"), buffer);
            }
            console.log("✅ Session file process finished.");
        } catch (e) {
            console.error("❌ Failed to restore session from ID:", e.message);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const usePairingCode = !!process.env.PAIRING_NUMBER && !state.creds.registered;
    if (!process.env.PAIRING_NUMBER && !state.creds.registered) {
        console.log("ℹ️  No PAIRING_NUMBER found in .env. Defaulting to QR code login.");
    }

    const NodeCache = require("node-cache");
    const msgRetryCounterCache = new NodeCache();
    
    const sock = makeWASocket({
        printQRInTerminal: !usePairingCode,
        auth: state,
        markOnline: true, 
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
        syncFullHistory: false,
        linkPreviewHighQuality: false,
        generateHighQualityLinkPreview: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
    });

    if (usePairingCode && !state.creds.registered && !process.env.SESSION_ID) {
        setTimeout(async () => {
            try {
                let pNumber = process.env.PAIRING_NUMBER.replace(/[^0-9]/g, "");
                const code = await sock.requestPairingCode(pNumber);
                console.clear();
                console.log("\n========================================");
                console.log("🔗 YOUR NEXUS-1MD PAIRING CODE:");
                console.log(`👉 ${code} 👈`);
                console.log("========================================\n");
                console.log("1. Open WhatsApp on your phone.");
                console.log("2. Go to Linked Devices > Link with Phone Number.");
                console.log(`3. Enter the code shown above.`);
            } catch (err) {
                console.error("❌ Failed to generate pairing code:", err);
            }
        }, 6000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !process.env.SESSION_ID) {
            console.clear();
            console.log("📲 Scan this QR to login:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            isReconnecting = false;
            console.log("✅ Bot connected and stable!");
            
            // Initialize Database (Centralized)
            const { initDb } = require("./lib/db");
            await initDb();
            
            const { loadSettings } = require("./lib/settings");
            await loadSettings(); 

            const myJid = sock.authState.creds.me.lid || sock.authState.creds.me.id || sock.user.id;
            global.myJid = myJid.includes(":") ? myJid.split(":")[0] + "@s.whatsapp.net" : (myJid.includes("@") ? myJid : myJid + "@s.whatsapp.net");
            
            console.log(`📊 Unified settings loaded. SELF-ID: ${global.myJid}`);

            if (isFirstConnect) {
                const { toJid } = require("./lib/utils");
                const { ownerNumbers, authFolder } = require("./config");
                isFirstConnect = false;
                const path = require("path");
                const fs = require("fs");
                
                // Generate Session ID for Heroku
                const creds = fs.readFileSync(path.join(__dirname, authFolder, "creds.json"), "utf-8");
                const sessionId = "BWM~" + Buffer.from(creds).toString("base64");
                
                console.log("\n========================================");
                console.log("💾 YOUR PERSISTENT SESSION ID (Keep Secret!):");
                console.log(`${sessionId}`);
                console.log("========================================\n");
                
                const primaryOwner = toJid(ownerNumbers[0]);
                await sock.sendMessage(primaryOwner, { 
                    text: `🤖 *Nexus-1MD is Online!*\n\n✅ *Connection:* Stable\n📦 *Session ID:* (Printed in Console)\n\n> Paste your Session ID in Heroku for 24/7 stability.` 
                });
            }


            setInterval(async () => {
                const { MessageLog } = require("./lib/messageModel");
                const { Op } = require("sequelize");
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                try {
                    await MessageLog.destroy({ where: { timestamp: { [Op.lt]: sevenDaysAgo } } });
                } catch (e) {}
            }, 24 * 60 * 60 * 1000);
        }

        if (connection === "close") {
            isReconnecting = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                const delay = 10000;
                console.log(`🔌 Disconnected. Reconnecting in ${delay/1000}s...`);
                setTimeout(() => connectionLogic(), delay);
            }
        }
    });

    const { handleAutomation } = require("./lib/automation");
    sock.ev.on("messages.upsert", async (upsert) => {
        const m = upsert.messages[0];
        if (!m.message) return;

        const sender = m.key.fromMe ? (global.myJid || m.key.remoteJid) : (m.key.participant || m.key.remoteJid);
        const { isOwner } = require("./lib/middleware");
        
        if (m.key.fromMe && !isOwner(sender)) return;

        await handleAutomation(sock, m);
        await handleMessages(sock, upsert); 
    });

    const { handleMessageDelete } = require("./lib/automation");
    sock.ev.on("messages.update", async (update) => {
        await handleMessageDelete(sock, update);
    });

    sock.ev.on("group-participants.update", async (update) => {

        const { id, participants, action } = update;
        const { getSettings } = require("./lib/settings");
        const settings = getSettings();
        if (action === "add" && settings.welcome) {
            for (let user of participants) {
                try {
                    const metadata = await sock.groupMetadata(id);
                    let msg = settings.welcomeMsg.replace("@user", `@${user.split("@")[0]}`).replace("@group", metadata.subject);
                    await sock.sendMessage(id, { text: msg, mentions: [user] });
                } catch (e) {}
            }
        }
    });
}

connectionLogic();

// 🌐 Health Check Server
app.get("/", (req, res) => res.send("🤖 Nexus-1MD is Online and Healthy!"));
app.listen(PORT, () => console.log(`🌍 Heartbeat server listening on port ${PORT}`));