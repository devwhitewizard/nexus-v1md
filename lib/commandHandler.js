const fs = require("fs");
const path = require("path");
const { prefixes, processedIdLimit } = require("../config");
const { runMiddleware, isOwner: checkIsOwner } = require("./middleware");
const { parseMessage } = require("./messageParser");
const { isOnCooldown, groupSpamGuard } = require("./cooldown");
const { loadPlugins } = require("../plugins/pluginLoader");
const { addXP } = require("./userModel");
const { getBotSettings } = require("../database/settings");

// ── Load all commands from /commands folder (Flat Directory) ─────────────────
const commands = new Map();
const commandsDir = path.join(__dirname, "../commands");

const loadCommands = () => {
    if (!fs.existsSync(commandsDir)) return;
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js") && !f.endsWith(".example"));

    for (const file of files) {
        const fullPath = path.join(commandsDir, file);
        try {
            const module = require(fullPath);
            
            // Helper to register a single command object
            const register = (cmd) => {
                if (!cmd.name || !cmd.execute) return false;
                if (!cmd.category) cmd.category = "general";
                const cmdName = cmd.name.toLowerCase();
                commands.set(cmdName, cmd);
                if (cmd.aliases && Array.isArray(cmd.aliases)) {
                    cmd.aliases.forEach(alias => commands.set(alias.toLowerCase(), cmd));
                }
                return true;
            };

            // 1. Try to register the main export
            const mainLoaded = register(module);
            
            // 2. Scan for other command objects in the same file (e.g. module.exports.afternoon = ...)
            Object.values(module).forEach(val => {
                if (typeof val === 'object' && val !== module) {
                    register(val);
                }
            });

            if (mainLoaded || Object.keys(module).length > 0) {
                console.log(`📦 Loaded: ${file}`);
            }
        } catch (e) {
            console.error(`❌ Error loading ${file}:`, e.message);
        }
    }
};

loadCommands();

console.log(`✅ Loaded ${commands.size} command(s): [${[...commands.keys()].join(", ")}]`);

// ── Load plugins (can register extra commands into the map) ──────────────────
loadPlugins(commands);

// ── Duplicate-message guard ──────────────────────────────────────────────────
const processedIds = new Set();

function isDuplicate(msgId) {
    if (processedIds.has(msgId)) return true;
    processedIds.add(msgId);
    if (processedIds.size > processedIdLimit) {
        processedIds.delete(processedIds.values().next().value);
    }
    return false;
}

// ── Main message handler (attach to sock.ev) ─────────────────────────────────
async function handleMessages(sock, { messages, type }) {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg?.message) return;

    // ── Robust Sender Identification ──────────────────────────────────────────
    // Capture real sender even for 'fromMe' (Self-Management)
    const sender = msg.key.fromMe ? (global.myJid || msg.key.remoteJid) : (msg.key.participant || msg.key.remoteJid);
    const jid = msg.key.remoteJid;
    const isGroup = jid.endsWith("@g.us");

    // Skip duplicates
    if (isDuplicate(msg.key.id)) return;

    // ── Handle Clickable/Interactive Responses ────────────────────────────────
    let textBody = "";
    const listResponse = msg.message.listResponseMessage || msg.message.buttonsResponseMessage || msg.message.templateButtonReplyMessage;

    if (listResponse) {
        textBody =
            listResponse.singleSelectReply?.selectedRowId ||
            listResponse.selectedButtonId ||
            listResponse.selectedId ||
            msg.message.buttonsResponseMessage?.selectedButtonId ||
            msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
            "";

        console.log(`🖱️ Extracted Command From Click: [${textBody}]`);
    } else {
        const parsed = parseMessage(msg);
        textBody = parsed.text;
    }

    const text = textBody;

    console.log(`📩 [${isGroup ? "G" : "DM"}][${jid}] ${text}`);

    // Must start with prefix OR be an interactive selection
    let commandName = "";
    let args = [];

    const prefix = prefixes.find((p) => text.toLowerCase().startsWith(p.toLowerCase()));

    if (prefix) {
        const cleanText = text.slice(prefix.length);
        args = cleanText.trim().split(/\s+/);
        commandName = (args.shift() || "").toLowerCase();
    } else {
        // 🟢 Interactive/Shortcut Logic (No prefix)
        const textLower = text.trim().toLowerCase();
        const menuShortcuts = { 
            "1": "admin", "2": "ai", "3": "download", "4": "group", "5": "sticker", 
            "6": "owner", "7": "general", "9": "anime", "10": "games", 
            "11": "social", "12": "fun", "13": "economy", "14": "media", 
            "15": "sports", "16": "system"
        };

        if (menuShortcuts[textLower]) {
            commandName = "menu";
            args = [menuShortcuts[textLower]];
        } else if (textLower === "8") {
            console.log("🎯 Shortcut 8 detected! Mapping to .dev");
            commandName = "dev";
            args = [];
        } else {
            // 🟢 Check if it's a known command (Allow no-prefix ONLY in DMs)
            const firstWord = textLower.split(/\s+/)[0];
            const isKnown = commands.has(firstWord) || [...commands.values()].some(c => c.aliases?.includes(firstWord));

            if (isKnown && !isGroup) {
                args = text.trim().split(/\s+/);
                commandName = args.shift().toLowerCase();
            }
        }
    }

    const command = commands.get(commandName);

    // 🎮 Game State Interception — route plain answers to active game sessions
    if (!command) {
        const { getGame, processGameInput } = require("./gameState");
        const session = getGame(jid);
        if (session) {
            await processGameInput({ sock, jid, sender, text, msg, session });
        }
        return;
    }

    console.log(`🕹️ Executing command: ${commandName}`);

    const isOwner = checkIsOwner(sender);

    // 🌪️ Bot-Storm Protection (Group Command Throttling)
    if (isGroup && !isOwner) {
        if (!global.stormTracker) global.stormTracker = {};
        const now = Date.now();
        if (!global.stormTracker[jid]) global.stormTracker[jid] = { count: 0, last: now, mutedUntil: 0 };
        
        const storm = global.stormTracker[jid];
        
        // Check if currently muted for spam
        if (now < storm.mutedUntil) return; 

        // Track command frequency
        if (now - storm.last < 30000) { // 30 second window
            storm.count++;
            if (storm.count > 8) { // If > 8 commands in 30 seconds
                storm.mutedUntil = now + (2 * 60 * 1000); // Mute for 2 minutes
                storm.count = 0; // Reset
                console.log(`🛡️ Bot-Storm Detected in ${jid}. Silencing for 2 mins.`);
                return await sock.sendMessage(jid, { text: "🛡️ *Bot-Storm Protection:* Excessive commands detected. I'm silencing myself in this group for 2 minutes to keep your account safe. _(Owner can still use commands)_" });
            }
        } else {
            storm.count = 1;
            storm.last = now;
        }
    }
    const settings = await getBotSettings();
    if (settings && settings.publicMode === false && !isOwner) {
        // Return silently or with a message? User requested: "they should get bot in private mode"
        return await sock.sendMessage(jid, { text: "🔒 *Access Denied:* This bot is currently in *Private Mode*. Only the owner can use it." });
    }
    if (settings && settings.lockedCommands) {
        const lockedList = settings.lockedCommands.split(",").map(c => c.trim().toLowerCase());
        if (lockedList.includes(command.name.toLowerCase()) && !isOwner) {
            return await sock.sendMessage(jid, { text: `🔒 *Command Locked:* The \`.${command.name}\` command is currently restricted to owners only.` });
        }
    }

    // ── Build context object ─────────────────────────────────────────────────
    const { msg: parsedMsg } = parseMessage(msg);
    const context = { sock, jid, sender, text, isGroup, msg: parsedMsg, args, commands };

    // ── Reward XP ────────────────────────────────────────────────────────────
    addXP(sender, 1);

    if (isGroup && groupSpamGuard(jid)) return;

    const cd = isOnCooldown(sender, commandName, command.cooldown ?? 3000);
    if (cd.active) {
        await sock.sendMessage(jid, { text: `⏳ Slow down! Wait ${Math.ceil(cd.remaining / 1000)}s` });
        return;
    }

    try {
        const allowed = await runMiddleware(context, command);
        if (!allowed) return;

        const sentMsg = await command.execute(context);
        
        // 🧹 Auto-Delete Bot Message
        // 📸 Handle Auto-Delete
        const settings = await getBotSettings();
        if (sentMsg && settings && settings.autoDelete && !command.noAutoDelete) {
            setTimeout(async () => {
                try {
                    await sock.sendMessage(jid, { delete: sentMsg.key });
                } catch (e) {
                    // silently fail if already deleted
                }
            }, settings.autoDeleteTime || 30000);
        }
    } catch (err) {
        console.error("⚠️  Command error:", err);
    }
    console.log(`🏁 Command handling finished for ${commandName}`);
}

module.exports = { handleMessages, commands };
