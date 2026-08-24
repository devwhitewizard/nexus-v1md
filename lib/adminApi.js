const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { getSettings, updateSettings } = require("./settings");
const { commands } = require("./commandHandler");
const { getBadwords, addBadword, removeBadword } = require("../database/badwords");
const { getRules, setRules } = require("../database/rules");

// Simple Auth Token for panel-bot communication
const crypto = require("crypto");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(16).toString("hex");

if (!process.env.ADMIN_TOKEN) {
    console.log("\n==================================================");
    console.log("🔑 SECURITY WARNING: Using dynamically generated ADMIN_TOKEN.");
    console.log(`Authorization Token: Bearer ${ADMIN_TOKEN}`);
    console.log("To persist a token, configure ADMIN_TOKEN in your .env");
    console.log("==================================================\n");
}

function initAdminApi(app) {
    // Enable JSON and URL encoded body parsing for API routes
    app.use("/api", express.json());
    app.use("/api", express.urlencoded({ extended: true }));

    // CORS middleware for API routes
    app.use("/api", (req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }
        next();
    });

    // Authentication middleware
    const authenticate = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
            return res.status(401).json({ error: "Unauthorized access: Invalid or missing token" });
        }
        next();
    };

    // 🩺 1. Bot Connection & System Status
    app.get("/api/bot/status", (req, res) => {
        const sock = global.sock;
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        
        let status = "offline";
        if (sock) {
            status = sock.user ? "online" : "connecting";
        }

        res.json({
            status,
            version: require("../config").version,
            uptime,
            memory: {
                rss: (memory.rss / 1024 / 1024).toFixed(2) + " MB",
                heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2) + " MB"
            },
            platform: process.platform,
            nodeVersion: process.version,
            user: sock && sock.user ? {
                id: sock.user.id.split(":")[0],
                name: sock.user.name || "Nexus Bot"
            } : null,
            latestQr: global.latestQr || null
        });
    });

    // 🔄 2. Bot Process Control
    app.post("/api/bot/restart", authenticate, (req, res) => {
        res.json({ success: true, message: "Bot process restarting gracefully..." });
        console.log("🔌 Restart command received from Admin Panel. Exiting process to trigger auto-restart.");
        setTimeout(() => {
            process.exit(0);
        }, 1500);
    });

    // 📨 3. Broadcast Announcement
    app.post("/api/bot/broadcast", authenticate, async (req, res) => {
        const { message, target } = req.body;
        const sock = global.sock;

        if (!sock || !sock.user) {
            return res.status(400).json({ error: "Bot is offline, cannot send broadcast" });
        }

        if (!message) {
            return res.status(400).json({ error: "Message content is required" });
        }

        try {
            let targets = [];
            if (target === "all" || !target) {
                // Read from history/storage logs to find active chats
                const jsonStore = require("../nexus/jsonStore");
                const allData = jsonStore.getAll();
                targets = Object.keys(allData)
                    .filter(k => k.startsWith("history_"))
                    .map(k => k.replace("history_", ""));
            } else {
                targets = Array.isArray(target) ? target : [target];
            }

            if (targets.length === 0) {
                return res.json({ success: true, sentCount: 0, message: "No active chats found to broadcast to." });
            }

            let sentCount = 0;
            for (const jid of targets) {
                try {
                    await sock.sendMessage(jid, { text: message });
                    sentCount++;
                    // Delay to prevent rate limiting
                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {
                    console.error(`Broadcast failed for JID ${jid}:`, err.message);
                }
            }

            res.json({ success: true, sentCount, totalTargets: targets.length });
        } catch (e) {
            res.status(500).json({ error: "Broadcast operation failed: " + e.message });
        }
    });

    // 💻 4. Remote Web Chat Terminal (Exec/Eval)
    app.post("/api/bot/terminal", authenticate, (req, res) => {
        const { type, code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Code or command is required" });
        }

        if (type === "eval") {
            try {
                const result = eval(code);
                res.json({ success: true, output: require("util").inspect(result) });
            } catch (err) {
                res.json({ success: false, output: err.stack || err.message });
            }
        } else {
            // Shell Exec command
            exec(code, (error, stdout, stderr) => {
                res.json({
                    success: !error,
                    output: stdout || stderr || (error ? error.message : "Command executed with no output.")
                });
            });
        }
    });

    // 📝 5. Recent System Logs Retrieval
    app.get("/api/bot/logs", authenticate, (req, res) => {
        const logPath = path.join(__dirname, "../bot.log");
        if (!fs.existsSync(logPath)) {
            return res.json({ logs: "Log file bot.log does not exist yet." });
        }

        fs.readFile(logPath, "utf-8", (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Failed to read logs: " + err.message });
            }

            // Return last 200 lines
            const lines = data.split("\n");
            const recent = lines.slice(-200).join("\n");
            res.json({ logs: recent });
        });
    });

    // ⚙️ 6. Load & Update Settings
    app.get("/api/data/settings", authenticate, (req, res) => {
        try {
            const settings = getSettings();
            // Unwrap data values if it's a Sequelize instance
            const data = settings.dataValues || settings;
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/data/settings", authenticate, async (req, res) => {
        try {
            const updates = req.body;
            const updated = await updateSettings(updates);
            res.json({ success: true, settings: updated.dataValues || updated });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // 👥 7. User Manager
    app.get("/api/data/users", authenticate, async (req, res) => {
        try {
            const { User } = require("../nexus/userModel");
            const { isOnline } = require("../nexus/db");
            const jsonStore = require("../nexus/jsonStore");

            let usersList = [];

            if (User && isOnline()) {
                const dbUsers = await User.findAll();
                usersList = dbUsers.map(u => u.dataValues || u);
            } else {
                // Read from JSON fallback
                const allData = jsonStore.getAll();
                usersList = Object.keys(allData)
                    .filter(k => k.startsWith("user_"))
                    .map(k => allData[k]);
            }

            // Hydrate banned/active status by reading warnings
            const warnings = {};
            if (User && isOnline()) {
                const { WarningDB } = require("../database/warnings");
                if (WarningDB) {
                    const warns = await WarningDB.findAll();
                    warns.forEach(w => {
                        warnings[w.userId] = (warnings[w.userId] || 0) + w.count;
                    });
                }
            } else {
                const allData = jsonStore.getAll();
                Object.keys(allData)
                    .filter(k => k.startsWith("warn_"))
                    .forEach(k => {
                        const parts = k.split("_");
                        const userId = parts[1];
                        warnings[userId] = (warnings[userId] || 0) + allData[k];
                    });
            }

            const hydrated = usersList.map(u => ({
                id: u.id,
                xp: u.xp || 0,
                level: u.level || 1,
                coins: u.coins || 0,
                warnings: warnings[u.id] || 0,
                status: u.banned ? "banned" : "active"
            }));

            res.json(hydrated);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/data/users/update", authenticate, async (req, res) => {
        const { userId, coins, xp, level, status } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        try {
            const { getUser } = require("../nexus/userModel");
            const user = await getUser(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const updates = {};
            if (coins !== undefined) updates.coins = parseInt(coins, 10);
            if (xp !== undefined) updates.xp = parseInt(xp, 10);
            if (level !== undefined) updates.level = parseInt(level, 10);
            if (status !== undefined) updates.banned = status === "banned";

            await user.update(updates);
            res.json({ success: true, user: user.dataValues || user });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // 🛡️ 8. Loaded Commands & Locking
    app.get("/api/data/commands", authenticate, (req, res) => {
        try {
            const settings = getSettings();
            const lockedList = settings.lockedCommands
                ? settings.lockedCommands.split(",").map(c => c.trim().toLowerCase())
                : [];

            const list = [];
            const processed = new Set();

            commands.forEach((cmd, name) => {
                if (processed.has(cmd.name.toLowerCase())) return;
                processed.add(cmd.name.toLowerCase());

                list.push({
                    name: cmd.name,
                    aliases: cmd.aliases || [],
                    category: cmd.category || "general",
                    description: cmd.description || "No description provided",
                    isLocked: lockedList.includes(cmd.name.toLowerCase())
                });
            });

            res.json(list);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/data/commands/lock", authenticate, async (req, res) => {
        const { commandName, lock } = req.body;

        if (!commandName) {
            return res.status(400).json({ error: "Command name is required" });
        }

        try {
            const settings = getSettings();
            let lockedList = settings.lockedCommands
                ? settings.lockedCommands.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
                : [];

            const cmdLower = commandName.trim().toLowerCase();
            if (lock) {
                if (!lockedList.includes(cmdLower)) {
                    lockedList.push(cmdLower);
                }
            } else {
                lockedList = lockedList.filter(c => c !== cmdLower);
            }

            const lockedString = lockedList.join(",");
            await updateSettings({ lockedCommands: lockedString });

            res.json({ success: true, lockedCommands: lockedString });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // 🛑 9. Badwords Control
    app.get("/api/data/badwords", authenticate, async (req, res) => {
        try {
            const words = await getBadwords();
            res.json(words);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/data/badwords", authenticate, async (req, res) => {
        const { word, action } = req.body; // action: add / remove

        if (!word) {
            return res.status(400).json({ error: "Word is required" });
        }

        try {
            if (action === "remove") {
                await removeBadword(word);
            } else {
                await addBadword(word);
            }
            const words = await getBadwords();
            res.json({ success: true, badwords: words });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // 📜 10. Group Rules Control
    app.get("/api/data/rules/:groupId", authenticate, async (req, res) => {
        const { groupId } = req.params;
        try {
            const rulesText = await getRules(groupId);
            res.json({ groupId, rulesText });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post("/api/data/rules", authenticate, async (req, res) => {
        const { groupId, rulesText } = req.body;

        if (!groupId || rulesText === undefined) {
            return res.status(400).json({ error: "groupId and rulesText are required" });
        }

        try {
            await setRules(groupId, rulesText);
            res.json({ success: true, groupId, rulesText });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
}

module.exports = { initAdminApi };
