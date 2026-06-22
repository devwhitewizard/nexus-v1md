const path = require("path");
const envResult = require("dotenv").config({ path: path.join(__dirname, ".env") });
if (envResult.error) {
    console.log("⚠️  Could not find .env file. Using system environment variables instead.");
} else {
    console.log("✅ .env file loaded successfully.");
}

// Global Exception Handlers to prevent process crashes on Baileys/libsignal socket errors
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("⚠️ Uncaught Exception:", error);
});

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
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

    // Prune stale temporary session files on startup to prevent disk bottlenecks
    const { cleanSessionFolder } = require("./lib/sessionCleaner");
    cleanSessionFolder(24, true);

    // Run automatic session pruning every 2 hours
    setInterval(() => {
        cleanSessionFolder();
    }, 2 * 60 * 60 * 1000);

    const fs = require("fs");
    const path = require("path");

    // 📦 SESSION ID AUTO-RESTORE
    if (process.env.SESSION_ID) {
        console.log("📦 SESSION_ID detected. Verifying session file...");
        const credsPath = path.join(__dirname, authFolder, "creds.json");
        const sessionExists = fs.existsSync(credsPath) && fs.statSync(credsPath).size > 10;
        
        if (!sessionExists) {
            console.log("📦 SESSION_ID found in .env and local credentials missing. Attempting to restore session...");
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
        } else {
            console.log("📦 Local creds.json already exists and is valid. Skipping SESSION_ID restoration to preserve updated keys.");
        }
    }

    // Initialize Database (Centralized)
    const { initDb } = require("./lib/db");
    await initDb();

    const { useDatabaseAuthState } = require("./lib/dbAuth");
    const { state, saveCreds } = await useDatabaseAuthState(authFolder);
    const usePairingCode = !!process.env.PAIRING_NUMBER && !state.creds.registered;
    if (!state.creds.registered && !process.env.PAIRING_NUMBER && !process.env.SESSION_ID) {
        console.log("ℹ️  No PAIRING_NUMBER or SESSION_ID found. Defaulting to QR code login.");
    }

    const NodeCache = require("node-cache");
    const msgRetryCounterCache = new NodeCache();
    
    // Standard Pino logger configured for error logs only to keep terminal clean
    const P = require("pino");
    const logger = P({ level: "error" });

    // Fetch latest WhatsApp Web version to bypass version checks on WhatsApp servers
    let version = [2, 3000, 1017531287]; // Fallback version
    try {
        const { version: latestVer } = await fetchLatestBaileysVersion();
        version = latestVer;
        console.log(`ℹ️ Using WhatsApp Web version: ${version.join(".")}`);
    } catch (e) {
        console.log("⚠️ Failed to fetch latest WhatsApp version, using fallback version.");
    }

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        logger,
        version,
        markOnline: true, // Mark online to ensure real-time message delivery
        browser: Browsers.macOS("Desktop"),
        msgRetryCounterCache,
        defaultQueryTimeoutMs: 60000, // Prevent queries from hanging indefinitely
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false, // Disable history syncing to save RAM and avoid memory leaks
        linkPreviewHighQuality: false,
        generateHighQualityLinkPreview: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        getMessage: async (key) => {
            try {
                const { getMessage } = require("./lib/messageModel");
                const msg = await getMessage(key.id);
                return msg ? msg.content : undefined;
            } catch (e) {
                return undefined;
            }
        }
    });
    global.sock = sock; // Expose globally for Admin Panel

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

        if (qr) {
            global.latestQr = qr;
        }

        if (qr && (!process.env.SESSION_ID || process.env.SESSION_ID_FAILED) && !usePairingCode) {
            console.clear();
            console.log("📲 Scan this QR to login:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            global.latestQr = null;
            isReconnecting = false;
            console.log("✅ Bot connected and stable!");
            
            const { loadSettings } = require("./lib/settings");
            await loadSettings(); 

            const myJid = (sock.user && sock.user.id) || (sock.authState.creds.me && sock.authState.creds.me.id) || (sock.authState.creds.me && sock.authState.creds.me.lid) || "";
            const cleanJid = myJid.split(":")[0];
            const domain = myJid.includes("@lid") ? "@lid" : "@s.whatsapp.net";
            global.myJid = cleanJid ? cleanJid + domain : "";
            
            console.log(`📊 Unified settings loaded. SELF-ID: ${global.myJid}`);

            // 🛡️ Super-Admin Detection
            const { isSudo } = require("./lib/middleware");
            const { ownerNumbers } = require("./config");
            const { toJid } = require("./lib/utils");
            const primarySudo = process.env.SUDO ? toJid(process.env.SUDO) : toJid(ownerNumbers[0]);
            
            console.log(`🛡️  Super-Admin (SUDO): ${primarySudo || "NOT CONFIGURED"}`);

            if (isFirstConnect) {
                isFirstConnect = false;
                const path = require("path");
                const fs = require("fs");
                const { authFolder, version } = require("./config");
                
                // Generate Session ID
                const credsPath = path.join(__dirname, authFolder, "creds.json");
                let sessionId = "NO_CREDS_FOUND";
                if (fs.existsSync(credsPath)) {
                    const creds = fs.readFileSync(credsPath, "utf-8");
                    sessionId = "NEXUS~" + Buffer.from(creds).toString("base64");
                }
                
                console.log("\n========================================");
                console.log("💾 YOUR PERSISTENT SESSION ID (Keep Secret!):");
                console.log(`${sessionId}`);
                console.log("========================================\n");
                
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

                // 📡 Reliable Message Delivery
                setTimeout(async () => {
                    try {
                        console.log("📨 Sending startup welcome message to bot...");
                        await sock.sendMessage(global.myJid, userWelcome);
                        console.log("✅ Startup message sent successfully.");

                        if (primarySudo && primarySudo !== global.myJid && isSudo(primarySudo)) {
                            console.log(`🛰️ Sending tech alert to Sudo: ${primarySudo}`);
                            await sock.sendMessage(primarySudo, adminAlert);
                        }
                    } catch (e) {
                        console.error("⚠️ Failed to send startup message:", e.message);
                    }
                }, 5000); // 5s delay to ensure socket is ready for message sending
            }


            // 🩺 Active Connection Watchdog (Detects silent zombie connections)
            if (global.healthCheckInterval) {
                clearInterval(global.healthCheckInterval);
            }
            global.healthCheckInterval = setInterval(async () => {
                try {
                    const wsOpen = sock && sock.ws && (
                        sock.ws.isOpen === true || 
                        sock.ws.readyState === 1 || 
                        (sock.ws.socket && sock.ws.socket.readyState === 1)
                    );
                    if (wsOpen) { // WebSocket is OPEN
                        // Query the blocklist to ensure socket responds and is not a zombie
                        await Promise.race([
                            sock.fetchBlocklist().catch(() => null),
                            new Promise((_, reject) => setTimeout(() => reject(new Error("Socket query timeout")), 15000))
                        ]);
                    } else {
                        throw new Error("WebSocket not open");
                    }
                } catch (err) {
                    console.error("⚠️ [Watchdog] Active connection health check failed:", err.message);
                    clearInterval(global.healthCheckInterval);
                    try { sock.end(); } catch (e) {}
                }
            }, 3 * 60 * 1000); // check every 3 minutes

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
            if (global.healthCheckInterval) {
                clearInterval(global.healthCheckInterval);
            }
            const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            
            console.log(`🔌 Connection closed. Status Code: ${statusCode}`);
            
            if (statusCode === DisconnectReason.loggedOut) {
                console.log("⚠️ [Self-Healing] Bot was logged out or unlinked. Wiping credentials and restarting connection to show fresh login...");
                const fs = require("fs");
                const path = require("path");
                const { authFolder } = require("./config");
                const credsPath = path.join(__dirname, authFolder, "creds.json");
                try {
                    if (fs.existsSync(credsPath)) fs.unlinkSync(credsPath);
                    const sessionDir = path.join(__dirname, authFolder);
                    if (fs.existsSync(sessionDir)) {
                        fs.readdirSync(sessionDir).forEach(file => {
                            try { fs.unlinkSync(path.join(sessionDir, file)); } catch(e){}
                        });
                    }
                } catch(e) {
                    console.error("Failed to clean session directory:", e.message);
                }
                
                setTimeout(() => connectionLogic(), 5000);
            } else {
                const delay = 10000;
                console.log(`🔌 Disconnected. Reconnecting in ${delay/1000}s...`);
                setTimeout(() => connectionLogic(), delay);
            }
        }
    });

    const { handleAutomation } = require("./lib/automation");
    sock.ev.on("messages.upsert", async (upsert) => {
        console.log(`📩 Raw event received: ${upsert.type}`);
        const m = upsert.messages[0];
        if (!m.message) {
            console.log("📩 Event has no message content, skipping.");
            return;
        }

        // Run automation in background to prevent blocking command replies (e.g. status-view delays)
        handleAutomation(sock, m).catch(err => console.error("⚠️ Automation Error:", err));
        await handleMessages(sock, upsert); 
    });

    const { handleMessageDelete } = require("./lib/automation");
    sock.ev.on("messages.update", async (update) => {
        await handleMessageDelete(sock, update);
    });

    // 📞 Anti-Call Protection (Controlled)
    sock.ev.on("call", async (calls) => {
        const { getSettings } = require("./lib/settings");
        const settings = getSettings();
        if (settings.antiCall) {
            for (const call of calls) {
                if (call.status === "offer") {
                    console.log(`📞 Anti-Call: Rejecting call from ${call.from}`);
                    await sock.rejectCall(call.id, call.from);
                }
            }
        }
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

// 🛠️ Admin Control Panel APIs
try {
    const { initAdminApi } = require("./lib/adminApi");
    initAdminApi(app);
} catch (e) {
    console.error("⚠️ Failed to load Admin API router:", e.message);
}

app.listen(PORT, () => console.log(`🌍 Heartbeat server listening on port ${PORT}`));