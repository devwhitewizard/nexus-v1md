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
global.app = app;
const PORT = process.env.PORT || 3000;
const { DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const qrcode = require("qrcode-terminal");
const zlib = require("zlib");

const { authFolder } = require("./config");
const { handleMessages } = require("./lib/commandHandler");
const { getMessage } = require("./lib/messageModel");
const { getSettings } = require("./lib/settings");

let isFirstConnect = true;
let isReconnecting = false;
let consecutiveFailures = 0;
let hasWipedSessionOnStartup = false;

async function connectionLogic() {
    if (isReconnecting) return;
    isReconnecting = true;

    // Prune stale temporary session files on startup to prevent disk bottlenecks
    const { cleanSessionFolder, cleanTempMedia } = require("./lib/sessionCleaner");
    cleanSessionFolder(24, true);
    try {
        const pruned = cleanTempMedia(6);
        if (pruned > 0) console.log(`🧹 Startup Pruning: Cleaned ${pruned} stale temp media file(s).`);
    } catch (e) {
        console.error("⚠️ Failed to clean temp media on startup:", e.message);
    }

    // Run automatic session pruning and temp media cleaning every 2 hours
    setInterval(() => {
        cleanSessionFolder();
        try {
            cleanTempMedia(6);
        } catch (e) {}
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
                const sessionId = rawId.includes("~") ? rawId.split("~")[1] : (rawId.startsWith("Nexus") ? rawId.slice(5) : rawId);
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
                            } catch (e) { }
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

    let { state, saveCreds } = await useMultiFileAuthState(authFolder);

    // Clean session directory on fresh login to prevent old/conflicting pre-key/session files from causing loops
    if (!hasWipedSessionOnStartup && !state.creds.registered && !process.env.SESSION_ID) {
        hasWipedSessionOnStartup = true;
        console.log("🧹 Fresh login setup detected. Wiping any old/corrupted keys from session directory...");
        try {
            const fs = require("fs");
            const path = require("path");
            const sessionDir = path.join(__dirname, authFolder);
            if (fs.existsSync(sessionDir)) {
                fs.readdirSync(sessionDir).forEach(file => {
                    try {
                        fs.unlinkSync(path.join(sessionDir, file));
                    } catch (e) {}
                });
            }
            // Re-load auth state after cleaning
            const freshState = await useMultiFileAuthState(authFolder);
            state = freshState.state;
            saveCreds = freshState.saveCreds;
        } catch (e) {
            console.error("⚠️ Failed to clean session folder on startup:", e.message);
        }
    }

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
        browser: Browsers.windows("Desktop"),
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
                const msg = await getMessage(key.id);
                return msg ? msg.content : undefined;
            } catch (e) {
                return undefined;
            }
        }
    });
    global.sock = sock; // Expose globally for Admin Panel

    // Custom wrapper for sendMessage to inject clickable "View Channel" label
    const originalSendMessage = sock.sendMessage.bind(sock);
    sock.sendMessage = async (jid, content, options = {}) => {
        const { getSettings } = require("./lib/settings");
        const settings = getSettings();

        // If hideViewChannel is false (meaning show the clickable View Channel label) and we have resolved the JID
        if (!settings.hideViewChannel && global.newsletterJid) {
            if (content && typeof content === "object" && !content.delete && !content.react) {
                if (!content.contextInfo) {
                    content.contextInfo = {};
                }
                // Only override if not already explicitly set
                if (!content.contextInfo.forwardedNewsletterMessageInfo) {
                    content.contextInfo.forwardingScore = 999;
                    content.contextInfo.isForwarded = true;
                    content.contextInfo.forwardedNewsletterMessageInfo = {
                        newsletterJid: global.newsletterJid,
                        newsletterName: global.newsletterName || "Nexus-MD Updates",
                        serverMessageId: 1
                    };
                }
            }
        }
        return await originalSendMessage(jid, content, options);
    };

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
                console.log("🔗 YOUR NEXUS-MD PAIRING CODE:");
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
            console.log("💡 QR Code too big, distorted, or hard to scan?");
            console.log(`👉 Open http://localhost:${PORT}/qr in your web browser for a clean, high-res QR code!\n`);
            console.log("📲 Scan this QR to login:\n");
            qrcode.generate(qr, { small: true });
            console.log("\n💡 QR Code too big, distorted, or hard to scan?");
            console.log(`👉 Open http://localhost:${PORT}/qr in your web browser for a clean, high-res QR code!\n`);
        }

        if (connection === "open") {
            global.latestQr = null;
            isReconnecting = false;
            consecutiveFailures = 0; // Reset failure counter on successful connection
            console.log("✅ Bot connected and stable!");

            // Initialize Database (Centralized)
            const { initDb } = require("./lib/db");
            await initDb();

            const { loadSettings, getSettings } = require("./lib/settings");
            await loadSettings();

            // Set up alwaysOnline presence updates
            const settings = getSettings();
            if (settings.alwaysOnline) {
                await sock.sendPresenceUpdate("available").catch(() => {});
            }

            if (global.alwaysOnlineInterval) clearInterval(global.alwaysOnlineInterval);
            global.alwaysOnlineInterval = setInterval(async () => {
                try {
                    const currentSettings = getSettings();
                    if (currentSettings.alwaysOnline) {
                        await sock.sendPresenceUpdate("available").catch(() => {});
                    }
                } catch (e) {}
            }, 15000);

            // Resolve newsletter metadata to get JID for "View Channel" feature
            try {
                console.log("📢 Resolving WhatsApp Channel JID for invite: 0029VbD62UY7IUYU6cftzu02");
                const metadata = await sock.newsletterMetadata("invite", "0029VbD62UY7IUYU6cftzu02").catch(() => null);
                if (metadata && metadata.id) {
                    global.newsletterJid = metadata.id;
                    global.newsletterName = metadata.subject || "Nexus-MD Updates";
                    console.log(`📢 Resolved Channel JID: ${global.newsletterJid} (${global.newsletterName})`);
                    
                    // Auto-follow channel on connection/deployment
                    const jsonStore = require("./lib/jsonStore");
                    if (!jsonStore.get("channel_autofollowed")) {
                        try {
                            await sock.newsletterFollow(global.newsletterJid);
                            jsonStore.set("channel_autofollowed", true);
                            console.log("✅ Successfully autofollowed channel!");
                        } catch (followErr) {
                            console.error("⚠️ Failed to autofollow resolved channel:", followErr.message);
                        }
                    }
                } else {
                    global.newsletterJid = "120363428521307680@newsletter"; // Fallback to user's known channel JID
                    global.newsletterName = "Nexus-MD Updates";
                    console.log(`⚠️ Metadata lookup returned null, using fallback JID: ${global.newsletterJid}`);
                }
            } catch (e) {
                console.error("⚠️ Failed to resolve newsletter JID:", e.message);
                global.newsletterJid = "120363428521307680@newsletter"; // Fallback JID
                global.newsletterName = "Nexus-MD Updates";
            }

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
                const { getSettings } = require("./lib/settings");
                const settings = getSettings();
                const botName = settings.botName || "Nexus-MD";

                const userWelcome = {
                    text: `✨ *${botName} v${version} Connected!* ✨\n\n` +
                        `🤖 *Status:* System fully operational.\n` +
                        `✅ *Secure:* Your connection is stable and encrypted.\n\n` +
                        `🌟 *Welcome!* Your bot is ready to serve. Type *.menu* to see what I can do!\n\n` +
                        `> Powered by Nexus Intelligence`
                };

                // 🛠️ TECHNICAL ADMIN MESSAGE
                const adminAlert = {
                    text: `🛠️ *${botName} v${version}: Connection Established*\n\n` +
                        `📦 *Session:* Restored/Initialized\n` +
                        `💾 *Storage:* Nexus-MD-100%\n\n` +
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
                    try { sock.end(); } catch (e) { }
                    process.exit(1);
                }
            }, 3 * 60 * 1000); // check every 3 minutes

            setInterval(async () => {
                const { MessageLog } = require("./lib/messageModel");
                const { Op } = require("sequelize");
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                try {
                    await MessageLog.destroy({ where: { timestamp: { [Op.lt]: sevenDaysAgo } } });
                } catch (e) { }
            }, 24 * 60 * 60 * 1000);
        }

        if (connection === "close") {
            isReconnecting = false;
            if (global.healthCheckInterval) {
                clearInterval(global.healthCheckInterval);
            }
            if (global.alwaysOnlineInterval) {
                clearInterval(global.alwaysOnlineInterval);
            }
            const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

            console.log(`🔌 Connection closed. Status Code: ${statusCode}`);

            // Detect if the failure is non-network related to avoid false-positive session wipes during internet outages
            const isNetworkError = 
                lastDisconnect?.error?.code === "ENOTFOUND" || 
                lastDisconnect?.error?.code === "EAI_AGAIN" || 
                lastDisconnect?.error?.code === "ECONNREFUSED" || 
                lastDisconnect?.error?.code === "ETIMEDOUT" || 
                lastDisconnect?.error?.code === "ECONNRESET" ||
                statusCode === DisconnectReason.connectionLost || 
                statusCode === DisconnectReason.connectionClosed || 
                statusCode === DisconnectReason.timedOut;

            if (!isNetworkError) {
                consecutiveFailures++;
                console.log(`⚠️ Non-network connection failure count: ${consecutiveFailures}/5`);
            }

            if (statusCode === DisconnectReason.loggedOut || consecutiveFailures >= 5) {
                if (consecutiveFailures >= 5) {
                    console.log("⚠️ [Self-Healing] Detected 5 consecutive session-related connection failures. Session may be corrupt. Wiping credentials and restarting...");
                } else {
                    console.log("⚠️ [Self-Healing] Bot was logged out or unlinked. Wiping credentials and restarting connection to show fresh login...");
                }
                consecutiveFailures = 0; // Reset counter
                hasWipedSessionOnStartup = false; // Reset wipe flag to allow startup cleanup on next run
                const fs = require("fs");
                const path = require("path");
                const { authFolder } = require("./config");
                const credsPath = path.join(__dirname, authFolder, "creds.json");
                try {
                    if (fs.existsSync(credsPath)) fs.unlinkSync(credsPath);
                    const sessionDir = path.join(__dirname, authFolder);
                    if (fs.existsSync(sessionDir)) {
                        fs.readdirSync(sessionDir).forEach(file => {
                            try { fs.unlinkSync(path.join(sessionDir, file)); } catch (e) { }
                        });
                    }
                } catch (e) {
                    console.error("Failed to clean session directory:", e.message);
                }

                setTimeout(() => connectionLogic(), 5000);
            } else {
                const delay = 10000;
                console.log(`🔌 Disconnected. Reconnecting in ${delay / 1000}s...`);
                setTimeout(() => connectionLogic(), delay);
            }
        }
    });

    const { handleAutomation } = require("./lib/automation");
    sock.ev.on("messages.upsert", async (upsert) => {
        const m = upsert.messages[0];
        if (!m.message) {
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
        try {
            const { id, participants, action } = update;
            const settings = getSettings();

            const jsonStore = require("./lib/jsonStore");
            const localMode = jsonStore.get(`events_mode_${id}`, null);
            const isActive = localMode !== null ? (localMode === "on") : settings.groupEventsGlobal;

            if (!isActive) return;

            const metadata = await sock.groupMetadata(id).catch(() => null);
            if (!metadata) return;

            const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
            const groupName = metadata.subject || "";
            const groupDesc = metadata.desc?.toString() || "";
            const memberCount = metadata.participants?.length || 0;

            for (const participant of participants) {
                const userMention = `@${participant.split("@")[0]}`;

                if (action === "add") {
                    const msgTemplate = jsonStore.get(`welcome_msg_${id}`, null) || settings.welcomeMsg || "Hi @user, welcome to *@group*! 👋";
                    const msg = msgTemplate
                        .replace(/@user/g, userMention)
                        .replace(/{group}/g, groupName)
                        .replace(/@group/g, groupName)
                        .replace(/{count}/g, memberCount)
                        .replace(/{time}/g, time)
                        .replace(/{desc}/g, groupDesc);
                    
                    await sock.sendMessage(id, { text: msg, mentions: [participant] }).catch(() => {});
                } else if (action === "remove") {
                    const msgTemplate = jsonStore.get(`goodbye_msg_${id}`, null) || settings.goodbyeMsg || "Goodbye @user, we hope to see you back soon! 😢";
                    const msg = msgTemplate
                        .replace(/@user/g, userMention)
                        .replace(/{group}/g, groupName)
                        .replace(/@group/g, groupName)
                        .replace(/{count}/g, memberCount)
                        .replace(/{time}/g, time)
                        .replace(/{desc}/g, groupDesc);
                    
                    await sock.sendMessage(id, { text: msg, mentions: [participant] }).catch(() => {});
                } else if (action === "promote" && settings.eventsPromote) {
                    const msg = `🎉 *Promotion Notice:*\n\n${userMention} has been promoted to Admin in this group.\n\n⌚ *Time:* ${time}`;
                    await sock.sendMessage(id, { text: msg, mentions: [participant] }).catch(() => {});
                } else if (action === "demote" && settings.eventsPromote) {
                    const msg = `⚠️ *Demotion Notice:*\n\n${userMention} is no longer an Admin in this group.\n\n⌚ *Time:* ${time}`;
                    await sock.sendMessage(id, { text: msg, mentions: [participant] }).catch(() => {});
                }
            }
        } catch (err) {
            console.error("⚠️ Error handling group-participants.update:", err.message);
        }
    });
}

connectionLogic();

// 🌐 Health Check Server
app.get("/", (req, res) => {
    const { getSettings } = require("./lib/settings");
    const settings = getSettings();
    const botName = settings.botName || "Nexus-MD";
    res.send(`🤖 ${botName} is Online and Healthy!`);
});

// 🛠️ Admin Control Panel APIs
try {
    const { initAdminApi } = require("./lib/adminApi");
    initAdminApi(app);
} catch (e) {
    console.error("⚠️ Failed to load Admin API router:", e.message);
}

app.listen(PORT, () => {
    console.log(`🌍 Heartbeat server listening on port ${PORT}`);
    console.log(`👉 If the terminal QR code is too big or hard to scan, open http://localhost:${PORT}/qr in your web browser to scan!\n`);
});