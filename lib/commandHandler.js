const fs = require("fs");
const path = require("path");
const { prefixes, processedIdLimit } = require("../config");
const { runMiddleware, isOwner: checkIsOwner } = require("./middleware");
const { parseMessage } = require("./messageParser");
const { isOnCooldown, groupSpamGuard } = require("./cooldown");
const { loadPlugins } = require("../plugins/pluginLoader");
const { addXP } = require("./userModel");
const { getSettings } = require("./settings");
const { getGame, processGameInput } = require("./gameState");

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
    if (type !== "notify" && type !== "append") return;

    const msg = messages[0];
    if (!msg?.message) {
        console.log("Empty message received, ignoring...");
        return;
    }

    // Skip processing old commands (e.g. offline/history sync messages) to prevent boot-up lag
    const msgAge = Math.floor(Date.now() / 1000) - (msg.messageTimestamp || 0);
    if (msgAge > 120) {
        return;
    }

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

    // Must start with prefix OR be an interactive selection
    let commandName = "";
    let args = [];

    const prefix = prefixes.find((p) => text.toLowerCase().startsWith(p.toLowerCase()));

    // Skip no-prefix messages from self (prevents bot from responding to its own responses/actions)
    // but allow menu shortcuts (e.g. "0"-"19") and active game session inputs
    const textLower = text.trim().toLowerCase();
    const isShortcut = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"].includes(textLower);
    const hasGameSession = typeof getGame === "function" && getGame(jid);

    if (msg.key.fromMe && !prefix && !isShortcut && !hasGameSession) return;

    if (prefix) {
        const cleanText = text.slice(prefix.length);
        args = cleanText.trim().split(/\s+/);
        commandName = (args.shift() || "").toLowerCase();
    } else {
        // 🟢 Interactive/Shortcut Logic (No prefix)
        // ⚠️  ONLY activate number shortcuts when the user is replying to a bot message.
        //     This prevents random numbers in chat (e.g. "14 people agreed") from
        //     accidentally triggering menu navigation or settings panels.
        const textLower = text.trim().toLowerCase();
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant
            || msg.message?.extendedTextMessage?.contextInfo?.remoteJid;
        const isReplyToBot = quotedParticipant === (global.myJid || "") || msg.key.fromMe;

        if (isReplyToBot) {
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = (
                quotedMessage?.conversation ||
                quotedMessage?.extendedTextMessage?.text ||
                quotedMessage?.imageMessage?.caption ||
                quotedMessage?.videoMessage?.caption ||
                ""
            ).toLowerCase();

            // Check if user is replying to a settings menu or detail panel
            const isSettingsReply = quotedText.includes("settings") || 
                                    quotedText.includes("reply 0 or .settings to go back") ||
                                    quotedText.includes("reply 0 to go back") ||
                                    quotedText.includes("reply 0 or \\.settings to go back") ||
                                    quotedText.includes("bot configuration") ||
                                    quotedText.includes("anti-link") ||
                                    quotedText.includes("anti-tag") ||
                                    quotedText.includes("anti-status-mention") ||
                                    quotedText.includes("anti-delete") ||
                                    quotedText.includes("status anti-delete") ||
                                    quotedText.includes("anti-call") ||
                                    quotedText.includes("group events") ||
                                    quotedText.includes("presence") ||
                                    quotedText.includes("auto view status") ||
                                    quotedText.includes("auto reply status") ||
                                    quotedText.includes("auto read") ||
                                    quotedText.includes("auto bio") ||
                                    quotedText.includes("chatbot (ai)") ||
                                    quotedText.includes("greet (dm auto-reply)") ||
                                    quotedText.includes("auto react") ||
                                    quotedText.includes("other commands");

            // Check if user is replying to the main category menu
            const isMainMenuReply = quotedText.includes("available categories:") || 
                                    quotedText.includes("menu") || 
                                    quotedText.includes("explore by typing .menu");

            if (isSettingsReply) {
                // Find choice based on quotedText
                let choice = null;
                if (quotedText.includes("settings") && (quotedText.includes("to configure:") || quotedText.includes("reply with"))) {
                    choice = "menu";
                } else if (quotedText.includes("bot configuration")) {
                    choice = 1;
                } else if (quotedText.includes("anti-link")) {
                    choice = 2;
                } else if (quotedText.includes("anti-tag") || quotedText.includes("anti-status-mention") || quotedText.includes("antitag")) {
                    choice = 3;
                } else if (quotedText.includes("status anti-delete")) {
                    choice = 5;
                } else if (quotedText.includes("anti-delete")) {
                    choice = 4;
                } else if (quotedText.includes("anti-call")) {
                    choice = 6;
                } else if (quotedText.includes("group events")) {
                    choice = 7;
                } else if (quotedText.includes("presence")) {
                    choice = 8;
                } else if (quotedText.includes("auto view status")) {
                    choice = 9;
                } else if (quotedText.includes("auto reply status")) {
                    choice = 10;
                } else if (quotedText.includes("auto read")) {
                    choice = 11;
                } else if (quotedText.includes("auto bio")) {
                    choice = 12;
                } else if (quotedText.includes("chatbot (ai)")) {
                    choice = 13;
                } else if (quotedText.includes("greet (dm auto-reply)")) {
                    choice = 14;
                } else if (quotedText.includes("auto react")) {
                    choice = 15;
                } else if (quotedText.includes("other commands")) {
                    choice = 16;
                }

                if (choice === "menu") {
                    const choiceNum = parseInt(textLower);
                    if (!isNaN(choiceNum) && choiceNum >= 0 && choiceNum <= 16) {
                        commandName = "settings";
                        args = [textLower];
                    }
                } else if (choice >= 1 && choice <= 16) {
                    const choiceNum = parseInt(textLower);
                    if (!isNaN(choiceNum)) {
                        if (choiceNum === 0) {
                            commandName = "settings";
                            args = ["0"];
                        } else if (choiceNum === choice) {
                            commandName = "settings";
                            args = [choice.toString(), "toggle"];
                        } else if (choiceNum >= 1 && choiceNum <= 16) {
                            commandName = "settings";
                            args = [choiceNum.toString()];
                        }
                    } else {
                        commandName = "settings";
                        args = [choice.toString(), textLower];
                    }
                }
            } else if (isMainMenuReply) {
                const menuShortcuts = { 
                    "1": "admin", "2": "ai", "3": "download", "4": "group", "5": "sticker", 
                    "6": "owner", "7": "general", "8": "sports", "10": "anime", 
                    "11": "games", "12": "social", "13": "fun", "14": "economy", 
                    "15": "media", "16": "system", "17": "textmaker", "18": "religion", 
                    "19": "dp"
                };

                if (menuShortcuts[textLower]) {
                    commandName = "menu";
                    args = [menuShortcuts[textLower]];
                } else if (textLower === "9") {
                    console.log("🎯 Shortcut 9 detected! Mapping to .dev");
                    commandName = "dev";
                    args = [];
                }
            }
        }
    }

    const command = commands.get(commandName);

    // 🎮 Game State Interception — route plain answers to active game sessions
    if (!command) {
        const session = getGame(jid);
        if (session) {
            await processGameInput({ sock, jid, sender, text, msg, session });
            return;
        }
        // Only notify if user explicitly used a prefix
        if (prefix && commandName) {
            await sock.sendMessage(jid, {
                text: `❓ *Command not found:* \`${prefix}${commandName}\`\n\nType *${prefix}menu* to see all available commands.`,
                quoted: msg
            });
        }
        return;
    }


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
    const settings = getSettings();
    if (settings && settings.publicMode === false && !isOwner) {
        // Return silently or with a message? User requested: "they should get bot in private mode"
        return await sock.sendMessage(jid, { text: "🔒 *Access Denied:* This bot is currently in *Private Mode*." });
    }
    if (settings && settings.lockedCommands) {
        const lockedList = settings.lockedCommands.split(",").map(c => c.trim().toLowerCase());
        if (lockedList.includes(command.name.toLowerCase()) && !isOwner) {
            return await sock.sendMessage(jid, { text: `🔒 *Command Locked:* The \`.${command.name}\` command is restricted to owners only.` });
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
        console.log(`🚀 Executing command [.${commandName}] for ${jid}...`);
        const allowed = await runMiddleware(context, command);
        if (!allowed) {
            console.log(`⚠️ Command [.${commandName}] blocked by middleware.`);
            return;
        }

        const sentMsg = await command.execute(context);
        console.log(`✅ Command [.${commandName}] executed successfully.`);
        
        // 🧹 Auto-Delete Bot Message
        // 📸 Handle Auto-Delete
        const settings = getSettings();
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
        try {
            await sock.sendMessage(jid, { 
                text: `❌ *Error:* Failed to execute command \`.${commandName}\`.\n\n` +
                      `📝 *Reason:* \`${err.message}\`\n\n` +
                      `💬 _Please verify your command usage or contact the bot owner if the issue persists._`
            }, { quoted: msg });
        } catch (sendErr) {
            console.error("⚠️ Failed to send error notification to chat:", sendErr.message);
        }
    }
    console.log(`🏁 Command handling finished for ${commandName}`);
}

module.exports = { handleMessages, commands };
