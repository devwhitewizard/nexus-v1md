const fs = require("fs");
const path = require("path");
const { prefixes, processedIdLimit } = require("../config");
const { runMiddleware } = require("./middleware");
const { parseMessage } = require("./messageParser");
const { isOnCooldown, groupSpamGuard } = require("./cooldown");
const { loadPlugins } = require("../plugins/pluginLoader");
const { addXP } = require("./userModel");

// ── Load all commands from /commands folder (including subfolders) ────────────
const commands = new Map();

function readCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            readCommands(fullPath);
        } else if (file.endsWith(".js") && !file.endsWith(".example")) {
            try {
                console.log(`📦 Loading: ${fullPath}`);
                const cmd = require(fullPath);
                if (!cmd.name || !cmd.execute) {
                    console.warn(`⚠️  Skipping ${file} — missing name or execute`);
                    continue;
                }
                // Use metadata or folder name as category if not specified
                if (!cmd.category) {
                    const parts = dir.split(path.sep);
                    const folderName = parts[parts.length - 1];
                    cmd.category = folderName === "commands" ? "general" : folderName;
                }
                
                const cmdName = cmd.name.toLowerCase();
                commands.set(cmdName, cmd);

                // Register Alises
                if (cmd.aliases && Array.isArray(cmd.aliases)) {
                    cmd.aliases.forEach(alias => {
                        commands.set(alias.toLowerCase(), cmd);
                    });
                }
            } catch (e) {
                console.error(`❌ Error loading ${file}:`, e.message);
                throw e;
            }
        }
    }
}

const commandsDir = path.join(__dirname, "../commands");
if (fs.existsSync(commandsDir)) readCommands(commandsDir);

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

    // Skip own messages
    if (msg.key.fromMe) return;

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

    const { jid, sender, isGroup, msg: parsedMsg } = parseMessage(msg);
    const text = textBody;

    console.log(`📩 [${isGroup ? "G" : "DM"}][${jid}] ${text}`);

    // Must start with prefix OR be an interactive selection
    let commandName = "";
    let args = [];

    const prefix = prefixes.find((p) => text.toLowerCase().startsWith(p.toLowerCase()));
    
    if (prefix) {
        const cleanText = text.startsWith(prefix) ? text.slice(prefix.length) : text;
        args = cleanText.trim().split(/\s+/);
        commandName = (args.shift() || "").toLowerCase();
    } else if (listResponse && text.length > 0) {
        // If it's an interactive click (like '.menu general'), parse it even if prefix is missing 
        // to be extremely defensive.
        const cleanText = text.replace(/^[.!#]/, ""); // Strip potential prefix
        args = cleanText.trim().split(/\s+/);
        commandName = (args.shift() || "").toLowerCase();
    } else {
        return; 
    }

    console.log(`🕹️ Detected command: ${commandName}`);

    const command = commands.get(commandName);
    if (!command) {
        console.log(`❓ Unknown command: ${commandName}. Available: [${[...commands.keys()].slice(0, 5).join(", ")}...]`);
        return;
    }

    // ── Build context object ─────────────────────────────────────────────────
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

        await command.execute(context);
    } catch (err) {
        console.error("⚠️  Command error:", err);
    }
}

module.exports = { handleMessages, commands };
