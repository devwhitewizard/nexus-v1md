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
            const decodeBuffer = (buf) => {
                try { return zlib.gunzipSync(buf).toString("utf-8"); } catch {
                    try { return zlib.inflateSync(buf).toString("utf-8"); } catch {
                        return buf.toString("utf-8");
                    }
                }
            };

            credsJson = decodeBuffer(buffer);
            // Check for double base64
            if (!credsJson.includes("{") && /^[a-zA-Z0-9+/=]+$/.test(credsJson.trim())) {
                const nestedBuffer = Buffer.from(credsJson.trim(), "base64");
                credsJson = decodeBuffer(nestedBuffer);
            }

            // 2. Smart Binary Search & Validation
            const extractValidJsonFromBuffer = (buf) => {
                const text = buf.toString("utf-8");
                const firstBrace = text.indexOf("{");
                if (firstBrace === -1) return null;
                
                // Scan for valid JSON blocks
                for (let i = 0; i < text.length; i++) {
                    if (text[i] === "{") {
                        try {
                            const candidate = text.substring(i, text.lastIndexOf("}") + 1);
                            if (candidate.includes("noiseKey") || candidate.includes("creds")) {
                                JSON.parse(candidate);
                                return candidate;
                            }
                        } catch (e) {}
                    }
                }
                return null;
            };

            const finalJson = extractValidJsonFromBuffer(Buffer.from(credsJson)) || extractValidJsonFromBuffer(buffer);

            if (finalJson) {
                console.log(`✅ Session JSON recovered (Size: ${finalJson.length} bytes)`);
                try {
                    let parsed = JSON.parse(finalJson);
                    let creds = parsed.creds || (parsed.noiseKey ? parsed : null);

                    if (creds) {
                        creds.registered = true;
                        const finalPath = path.join(__dirname, authFolder, "creds.json");
                        if (!fs.existsSync(path.dirname(finalPath))) fs.mkdirSync(path.dirname(finalPath), { recursive: true });
                        fs.writeFileSync(finalPath, JSON.stringify(creds));
                        console.log(`✅ Credentials written to: ${finalPath}`);
                    }
                } catch (e) {
                    console.error("❌ Session JSON parse failed:", e.message);
                }
            } else {
                console.error("❌ Error: Could not find valid JSON in Session ID.");
            }
            console.log("✅ Session restoration flow complete.");
        } catch (e) {
            console.error("❌ Failed to restore session from ID:", e.message);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const usePairingCode = !!process.env.PAIRING_NUMBER && !state.creds.registered;
    if (!process.env.PAIRING_NUMBER && !state.creds.registered && !process.env.SESSION_ID) {
        console.log("ℹ️  No PAIRING_NUMBER found in .env. Defaulting to QR code login.");
    } else if (process.env.SESSION_ID && !state.creds.registered) {
        console.log("ℹ️  Using SESSION_ID for restoration. QR and Pairing Code are disabled.");
    }

    const NodeCache = require("node-cache");
    const msgRetryCounterCache = new NodeCache();
    
    const sock = makeWASocket({
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

    // ⌚ WATCHDOG: If SESSION_ID is present but fails to connect within 30s, enable QR.
    let connectionTimeout = null;
    if (process.env.SESSION_ID) {
        connectionTimeout = setTimeout(() => {
            if (!sock.user) {
                console.log("⚠️  Session ID failed to connect within 30s. Enabling QR fallback...");
                process.env.SESSION_ID_FAILED = "true";
            }
        }, 30000);
    }

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

        if (qr && (!process.env.SESSION_ID || process.env.SESSION_ID_FAILED)) {
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
                const { version } = require("./config");
                
                // 💎 PREMIUM USER MESSAGE
                const userWelcome = { 
                    text: `✨ *Nexus-1MD v${version} Connected!* ✨\n\n` +
                          `🤖 *Status:* System fully operational.\n` +
                          `✅ *Secure:* Your connection is stable and encrypted.\n\n` +
                          `🌟 *Welcome!* Your bot is ready to serve. Type *.menu* to see what I can do!\n\n` +
                          `> Powered by Nexus Intelligence`
                };

                // 🛠️ TECHNICAL ADMIN MESSAGE
                const adminAlert = {
                    text: `🛠️ *Nexus Admin: Connection Established*\n\n` +
                          `📦 *Session:* Restored/Initialized\n` +
                          `💾 *Storage:* Binary-Free Fallback Active\n\n` +
                          `> Session ID has been printed to your private console.`
                };

                // 📡 Send the beautiful message to the Bot Account (Self)
                await sock.sendMessage(global.myJid, userWelcome);

                // 🛰️ Send technical details ONLY to the SUDO/Owner if they are different
                if (primaryOwner && primaryOwner !== global.myJid) {
                    await sock.sendMessage(primaryOwner, adminAlert);
                }
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