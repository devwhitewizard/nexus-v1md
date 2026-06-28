const { saveMessage, getMessage, MessageLog } = require("./messageModel");
const { getSettings } = require("./settings");
const { ownerNumbers } = require("../config");
const { getAfk, removeAfk } = require("./afk");
const fs = require("fs");
const jsonStore = require("./jsonStore");
const { isOwner, isAdmin } = require("./middleware");
const { toJid } = require("./utils");
const { isOnline } = require("./db");
const { getBadwords } = require("../database/badwords");

// Cache to prevent duplicate notifications for deletes/edits
const processedEvents = new Set();
const currentlyGreeting = new Set();

const isFamiliar = async (jid) => {
    // Owner/Sudo is always familiar
    if (isOwner(jid)) return true;

    // Check in greeted_users list
    const greetedUsers = jsonStore.get("greeted_users") || [];
    if (greetedUsers.includes(jid)) return true;

    // Check if history exists
    const history = jsonStore.get(`history_${jid}`) || [];
    if (history.length > 0) {
        greetedUsers.push(jid);
        jsonStore.set("greeted_users", greetedUsers);
        return true;
    }

    // Check database MessageLog
    if (MessageLog && isOnline()) {
        try {
            const count = await MessageLog.count({ where: { remoteJid: jid } });
            if (count > 0) {
                greetedUsers.push(jid);
                jsonStore.set("greeted_users", greetedUsers);
                return true;
            }
        } catch (e) {
            console.error("isFamiliar DB query error:", e.message);
        }
    }

    return false;
};


/**
 * Handles all background automation (Anti-Delete, Auto-Status, etc.)
 */
const handleAutomation = async (sock, m) => {
    try {
        const settings = getSettings();
        const jid = m.key.remoteJid;

        // 0. Intercept protocolMessage (Delete/Edit) immediately in upsert
        if (m.message?.protocolMessage) {
            await handleMessageDeleteOrEdit(sock, m, true);
            return;
        }

        const isGroup = jid.endsWith("@g.us");

        // Greet DM logic for unfamiliar contacts
        if (!isGroup && !m.key.fromMe && jid !== "status@broadcast" && settings.greetDM && m.message && !m.message.reactionMessage) {
            if (!currentlyGreeting.has(jid)) {
                const familiar = await isFamiliar(jid);
                if (!familiar) {
                    currentlyGreeting.add(jid);
                    try {
                        const greetMsg = settings.greetDMMsg || "Hello World";
                        await sock.sendMessage(jid, { text: greetMsg }, { quoted: m });
                        console.log(`👋 Sent custom greetDM to ${jid}: ${greetMsg}`);
                        
                        const greetedUsers = jsonStore.get("greeted_users") || [];
                        if (!greetedUsers.includes(jid)) {
                            greetedUsers.push(jid);
                            jsonStore.set("greeted_users", greetedUsers);
                        }
                    } catch (err) {
                        console.error("⚠️ Failed to send greetDM:", err.message);
                    } finally {
                        currentlyGreeting.delete(jid);
                    }
                }
            }
        }

        // 1. Presence Logic (Typing/Recording/Online) - ⏳ THROTTLED (15s)
        if (m.message && !m.key.fromMe) {
            const hasGroupPresence = isGroup && settings.groupPresence;
            const hasDmPresence = !isGroup && settings.dmPresence;
            const hasAutoType = settings.autoType;
            const hasAutoRecord = settings.autoRecord;

            if (hasGroupPresence || hasDmPresence || hasAutoType || hasAutoRecord) {
                if (!global.presenceTracker) global.presenceTracker = {};
                const now = Date.now();
                const last = global.presenceTracker[jid] || 0;
                if (now - last > 15000) { // Only send once every 15 seconds
                    global.presenceTracker[jid] = now;
                    
                    let presenceStatus = "composing";
                    if (hasAutoRecord) {
                        presenceStatus = "recording";
                    } else if (hasAutoType || hasGroupPresence || hasDmPresence) {
                        presenceStatus = "composing";
                    }
                    
                    await sock.sendPresenceUpdate(presenceStatus, jid).catch(() => {});
                }
            }

            // Reinforce always online status if enabled
            if (settings.alwaysOnline) {
                if (!global.alwaysOnlineTracker) global.alwaysOnlineTracker = 0;
                const now = Date.now();
                if (now - global.alwaysOnlineTracker > 15000) {
                    global.alwaysOnlineTracker = now;
                    await sock.sendPresenceUpdate("available").catch(() => {});
                }
            }
        }

        // 2. Advanced Auto-Status System (Check this BEFORE m.message guard)
        if (jid === "status@broadcast") {
            // Skip old status updates (e.g. from boot sync) to prevent flooding
            const age = Math.floor(Date.now() / 1000) - (m.messageTimestamp || 0);
            if (age > 300) {
                return;
            }
            console.log("🌟 Status update detected!");

            // Log status update to DB/download media if statusAntiDelete is enabled
            if (settings.statusAntiDelete) {
                await saveMessage(m, sock);
            }

            // 🟢 STEALTH MODE: Add a random human-like delay (2 - 8 seconds)
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            const randomDelay = Math.floor(Math.random() * 6000) + 2000;

            // A. Auto View
            if (settings.autoViewStatus) {
                await delay(randomDelay);
                await sock.readMessages([m.key]);
                console.log(`👁️ Status viewed (Delayed: ${randomDelay}ms) from: ${m.pushName || "User"}`);
            }

            // B. Auto Like (React)
            if (settings.autoLikeStatus) {
                await delay(1000); // Small extra gap
                const emojiStr = settings.statusLikeEmojis || "❤️,✨,🔥,🙌,👍,⭐,💥,🎉,💯,😎,🤩,😍,👏";
                const emojis = typeof emojiStr === "string" ? emojiStr.split(",") : ["❤️", "✨", "🔥", "🙌", "👍", "⭐", "💥", "🎉", "💯", "😎", "🤩", "😍", "👏"];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage("status@broadcast", {
                    react: { text: randomEmoji.trim(), key: m.key }
                }, { statusJidList: [m.key.participant] });
                console.log(`❤️ Status liked with ${randomEmoji} from: ${m.pushName}`);
            }

            // C. Auto Reply
            if (settings.autoReplyStatus) {
                await sock.sendMessage(m.key.participant, { 
                    text: settings.statusReplyText || "Nice status! ✨" 
                }, { quoted: m });
                console.log(`💬 Auto-replied to status from: ${m.pushName}`);
            }
            return; // Don't log status messages to DB twice or proceed further
        }

        if (!m.message) return;

    // A. AFK Mention Detection
    const sender = m.key.participant || m.key.remoteJid;
    const mentionedJids = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    for (const mentioned of mentionedJids) {
        const afk = getAfk(jid, mentioned);
        if (afk && !isGroup) {
            await sock.sendMessage(jid, { 
                text: `🤫 *@${mentioned.split("@")[0]}* is currently AFK!\n📝 *Reason:* ${afk.reason}\n⏳ *Since:* ${new Date(afk.time).toLocaleTimeString()}`,
                mentions: [mentioned]
            }, { quoted: m });
        }
    }

    // B. AFK Removal Detection
    if (getAfk(jid, sender) && !isGroup) {
        removeAfk(jid, sender);
        await sock.sendMessage(jid, { 
            text: `👋 *@${sender.split("@")[0]}* is back! AFK status removed.`,
            mentions: [sender]
        }, { quoted: m });
    }

    // 3. Message Logger & Anti-ViewOnce (Save for recovery)
    const logData = await saveMessage(m, sock);
    
    // Anti-ViewOnce: Forward immediately if it's a View-Once message
    const isViewOnce = m.message?.viewOnceMessageV2 || m.message?.viewOnceMessage;
    if (isViewOnce && settings.antiViewOnce !== false) {
        const original = await getMessage(m.key.id);
        if (original && original.mediaPath) {
            for (const rawOwner of [process.env.SUDO || ownerNumbers[0]]) {
                const targetLog = toJid(rawOwner);
                try {
                    const botName = settings.botName || "Nexus-MD";
                    const typeLabel = original.messageType.replace("Message", "");
                    const caption = `*👁️ ANTI-VIEW ONCE DETECTED*\n━━━━━━━━━━━━━━━━━━━\n\n👤 *From:* ${m.pushName} (@${sender.split("@")[0]})\n📦 *Type:* ${typeLabel}\n\n> ${botName} Protection`;
                    
                    let mediaObj = {};
                    if (original.messageType === "imageMessage") mediaObj = { image: { url: original.mediaPath } };
                    else if (original.messageType === "videoMessage") mediaObj = { video: { url: original.mediaPath } };

                    if (Object.keys(mediaObj).length > 0) {
                        await sock.sendMessage(targetLog, { ...mediaObj, caption, mentions: [sender] });
                    }
                } catch (e) {
                    console.error("[Anti-ViewOnce] Error forwarding:", e.message);
                }
            }
        }
    }

    // 3.5. Auto Read — mark messages as read immediately
    if (settings.autoRead && !m.key.fromMe) {
        await sock.readMessages([m.key]).catch(() => {});
    }

    // 3.6. Auto React — react with a random emoji to incoming messages
    const reactEmojis = ["❤️", "🔥", "😂", "👍", "🎉", "💯", "😍", "✨", "🤩", "😎"];
    if (!m.key.fromMe && m.message) {
        const shouldReact = (isGroup && settings.autoReactGrp) || (!isGroup && settings.autoReactDM && jid !== "status@broadcast");
        if (shouldReact) {
            const emoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
            await sock.sendMessage(jid, { react: { text: emoji, key: m.key } }).catch(() => {});
        }
    }

    // 4. Advanced Anti-Link Protection
    if (isGroup && !m.key.fromMe) {
        const localMode = jsonStore.get(`antilink_mode_${jid}`, null);
        const activeMode = localMode !== null ? localMode : (settings.antiLinkGlobal || "off");

        if (activeMode !== "off") {
            const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
            const linkRegex = /chat\.whatsapp\.com|wa\.me|(https?:\/\/[^\s]+)/i;
            
            if (linkRegex.test(text)) {
                const groupMetadata = await sock.groupMetadata(jid).catch(() => null);
                if (groupMetadata) {
                    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                    const groupAdmins = groupMetadata.participants.filter(p => p.admin || p.isSuperAdmin).map(p => p.id);
                    
                    if (sender !== botJid && !isOwner(sender) && !groupAdmins.includes(sender)) {
                        const limit = settings.antiLinkLimit || 3;
                        const warnKey = `antilink_warns_${jid}_${sender}`;

                        if (activeMode === "warn") {
                            const currentWarns = jsonStore.get(warnKey, 0) + 1;
                            jsonStore.set(warnKey, currentWarns);

                            if (currentWarns >= limit) {
                                await sock.groupParticipantsUpdate(jid, [sender], "remove");
                                await sock.sendMessage(jid, { 
                                    text: `🚫 *@${sender.split("@")[0]}* has been removed for reaching the Anti-Link warning limit (*${currentWarns}/${limit}*).`,
                                    mentions: [sender]
                                });
                                jsonStore.set(warnKey, 0);
                            } else {
                                await sock.sendMessage(jid, { 
                                    text: `⚠️ *@${sender.split("@")[0]}*, links are not allowed in this group!\n⚠️ *Warning:* ${currentWarns}/${limit}`,
                                    mentions: [sender]
                                }, { quoted: m });
                            }
                        } else if (activeMode === "delete") {
                            await sock.sendMessage(jid, { delete: m.key });
                            
                            const currentWarns = jsonStore.get(warnKey, 0) + 1;
                            jsonStore.set(warnKey, currentWarns);

                            if (currentWarns >= limit) {
                                await sock.groupParticipantsUpdate(jid, [sender], "remove");
                                await sock.sendMessage(jid, { 
                                    text: `🚫 *@${sender.split("@")[0]}* has been removed for reaching the Anti-Link warning limit (*${currentWarns}/${limit}*).`,
                                    mentions: [sender]
                                });
                                jsonStore.set(warnKey, 0);
                            } else {
                                await sock.sendMessage(jid, { 
                                    text: `⚠️ Links are not allowed in this group. Message deleted!\n⚠️ *@${sender.split("@")[0]}* Warning: ${currentWarns}/${limit}`,
                                    mentions: [sender]
                                });
                            }
                        } else if (activeMode === "remove") {
                            await sock.sendMessage(jid, { delete: m.key });
                            await sock.groupParticipantsUpdate(jid, [sender], "remove");
                            await sock.sendMessage(jid, { 
                                text: `🚫 *@${sender.split("@")[0]}* has been removed immediately for sending a link.`,
                                mentions: [sender]
                            });
                        }
                    }
                }
            }
        }

        // Anti-Status-Mention Protection
        const localStatusMentionMode = jsonStore.get(`antistatusmention_mode_${jid}`, null);
        const activeStatusMentionMode = localStatusMentionMode !== null ? localStatusMentionMode : (settings.antiStatusMentionGlobal || "off");

        if (activeStatusMentionMode !== "off") {
            const hasStatusMention = !!m.message?.statusMentionMessage;
            if (hasStatusMention) {
                const groupMetadata = await sock.groupMetadata(jid).catch(() => null);
                if (groupMetadata) {
                    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                    const groupAdmins = groupMetadata.participants.filter(p => p.admin || p.isSuperAdmin).map(p => p.id);

                    if (sender !== botJid && !isOwner(sender) && !groupAdmins.includes(sender)) {
                        const limit = settings.antiStatusMentionLimit || 3;
                        const warnKey = `antistatusmention_warns_${jid}_${sender}`;

                        if (activeStatusMentionMode === "warn") {
                            const currentWarns = jsonStore.get(warnKey, 0) + 1;
                            jsonStore.set(warnKey, currentWarns);

                            if (currentWarns >= limit) {
                                await sock.groupParticipantsUpdate(jid, [sender], "remove");
                                await sock.sendMessage(jid, { 
                                    text: `🚫 *@${sender.split("@")[0]}* has been removed for reaching the Anti-Status-Mention warning limit (*${currentWarns}/${limit}*).`,
                                    mentions: [sender]
                                });
                                jsonStore.set(warnKey, 0);
                            } else {
                                await sock.sendMessage(jid, { 
                                    text: `⚠️ *@${sender.split("@")[0]}*, status mentions are not allowed in this group!\n⚠️ *Warning:* ${currentWarns}/${limit}`,
                                    mentions: [sender]
                                }, { quoted: m });
                            }
                        } else if (activeStatusMentionMode === "delete") {
                            await sock.sendMessage(jid, { delete: m.key });

                            const currentWarns = jsonStore.get(warnKey, 0) + 1;
                            jsonStore.set(warnKey, currentWarns);

                            if (currentWarns >= limit) {
                                await sock.groupParticipantsUpdate(jid, [sender], "remove");
                                await sock.sendMessage(jid, { 
                                    text: `🚫 *@${sender.split("@")[0]}* has been removed for reaching the Anti-Status-Mention warning limit (*${currentWarns}/${limit}*).`,
                                    mentions: [sender]
                                });
                                jsonStore.set(warnKey, 0);
                            } else {
                                await sock.sendMessage(jid, { 
                                    text: `⚠️ Status mentions are not allowed in this group. Message deleted!\n⚠️ *@${sender.split("@")[0]}* Warning: ${currentWarns}/${limit}`,
                                    mentions: [sender]
                                });
                            }
                        } else if (activeStatusMentionMode === "remove") {
                            await sock.sendMessage(jid, { delete: m.key });
                            await sock.groupParticipantsUpdate(jid, [sender], "remove");
                            await sock.sendMessage(jid, { 
                                text: `🚫 *@${sender.split("@")[0]}* has been removed immediately for sending a status mention.`,
                                mentions: [sender]
                            });
                        }
                    }
                }
            }
        }
    }

    // 5. Anti-Badword Protection
    if (isGroup && settings.antiBadword && !m.key.fromMe) {
        if (!isOwner(sender) && !await isAdmin(sender, jid, sock)) {
            const badwords = await getBadwords();
            const text = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").toLowerCase();
            
            if (badwords.some(word => text.includes(word.toLowerCase()))) {
                console.log(`🚫 Anti-Badword: Deleting offensive message from ${sender}`);
                await sock.sendMessage(jid, { delete: m.key });
                return;
            }
        }
    }

    // 6. Anti-Spam Protection
    if (isGroup && settings.antiSpam && !m.key.fromMe) {
        if (isOwner(sender) || await isAdmin(sender, jid, sock)) return; // Don't flag admins/owners
        
        if (!global.spamTracker) global.spamTracker = {};
        const now = Date.now();
        const key = `${jid}_${sender}`;

        if (!global.spamTracker[key]) global.spamTracker[key] = { count: 0, last: now };
        
        const userData = global.spamTracker[key];
        if (now - userData.last < 2000) { // 2 seconds window
            userData.count++;
            if (userData.count > 5) {
                console.log(`🚫 Anti-Spam: Deleting flood from ${sender}`);
                await sock.sendMessage(jid, { delete: m.key });
                userData.count = 0; // reset
                return;
            }
        } else {
            userData.count = 1;
        }
        userData.last = now;
    }

    } catch (err) {
        console.error("⚠️ Automation Error:", err);
    }
};


/**
 * Unified handler for message deletes and edits.
 * Can be triggered via upsert or update events.
 */
const handleMessageDeleteOrEdit = async (sock, item, isUpsert = false) => {
    try {
        const settings = getSettings();
        
        let key, messageData;
        if (isUpsert) {
            key = item.key;
            messageData = item;
        } else {
            key = item.key;
            messageData = item.update;
        }

        if (!key || !messageData) return;

        // 1. Identification
        const protocol = messageData.protocolMessage || messageData.message?.protocolMessage;
        const stubType = messageData.messageStubType;

        let isDelete = (protocol?.type === 0 || protocol?.type === 3);
        let isEdit = (protocol?.type === 14);
        let targetId = protocol?.key?.id;

        // Fallback for Stub revocations
        if (!isDelete && (stubType === 1 || stubType === 68)) {
            isDelete = true;
            targetId = key.id;
        }

        // Fallback for decrypted edit updates (no protocol message, key.id is the target)
        if (!isDelete && !isEdit && !isUpsert && messageData.message) {
            targetId = key.id;
        }

        if (!targetId) return;

        // 2. Deduplication using processedEvents Set
        const eventKey = isDelete 
            ? `delete_${targetId}` 
            : `edit_${targetId}_${JSON.stringify(protocol?.editedMessage || messageData.editedMessage || messageData.message || "")}`;
            
        if (processedEvents.has(eventKey)) return;

        // 3. Fetch original message from DB
        const original = await getMessage(targetId);
        if (!original) return;

        const extractText = (msg) => {
            if (!msg) return "";
            let m = msg.editedMessage || msg.message || msg;
            
            // Un-wrap nested message structures (Baileys message edit or view-once wrapper)
            while (m && (m.message || m.editedMessage || m.viewOnceMessageV2 || m.viewOnceMessage || m.documentWithCaptionMessage)) {
                if (m.editedMessage) m = m.editedMessage.message || m.editedMessage;
                else if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message || m.viewOnceMessageV2;
                else if (m.viewOnceMessage) m = m.viewOnceMessage.message || m.viewOnceMessage;
                else if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message || m.documentWithCaptionMessage;
                else if (m.message) m = m.message;
                else break;
            }
            
            if (!m) return "";
            return m.conversation || 
                   m.extendedTextMessage?.text || 
                   m.imageMessage?.caption || 
                   m.videoMessage?.caption || 
                   m.documentWithCaptionMessage?.message?.documentMessage?.caption || 
                   (typeof m === "string" ? m : "");
        };

        // Decrypted edit detection fallback verification
        if (!isDelete && !isEdit && !isUpsert && messageData.message) {
            const oldText = extractText(original.content);
            const newText = extractText(messageData);
            
            if (oldText && newText && oldText !== newText) {
                isEdit = true;
            } else {
                return; // Not a verified edit with text change
            }
        }

        processedEvents.add(eventKey);
        
        // Limit cache size to 1000
        if (processedEvents.size > 1000) {
            processedEvents.delete(processedEvents.values().next().value);
        }

        const isStatus = original.remoteJid === "status@broadcast";
        
        // 4. Toggle Settings Check
        const shouldProcess = isStatus 
            ? (isDelete && settings.statusAntiDelete)
            : ((isDelete && settings.antiDelete) || (isEdit && settings.antiEdit));

        if (!shouldProcess) return;

        console.log(`[Anti-Delete/Edit] Processing ${isDelete ? "DELETE" : "EDIT"} for ID: ${targetId} (${isStatus ? "Status" : "Chat"})`);

        // 5. Format and send the notification
        const sender = original.participant || original.remoteJid;
        const senderNum = sender.split("@")[0];
        const isGroup = original.remoteJid.endsWith("@g.us");
        
        const label = isStatus 
            ? "*🕵️ STATUS ANTI-DELETE REPORT*" 
            : (isDelete ? "*🕵️ ANTI-DELETE REPORT*" : "*✏️ ANTI-EDIT REPORT*");
        const timeZone = "Africa/Nairobi";
        const currentTime = new Date().toLocaleTimeString("en-GB", { timeZone });
        const currentDate = new Date().toLocaleDateString("en-GB", { timeZone });
        const origTime = new Date(original.timestamp * 1000).toLocaleTimeString("en-GB", { timeZone });

        let alertText = `${label}\n\n`;
        alertText += `*👤 User:* @${senderNum}\n`;
        alertText += `*🕙 Orig Time:* ${origTime}\n`;
        alertText += `*🕒 ${isDelete ? "Delete" : "Edit"} Time:* ${currentTime}\n`;
        alertText += `*📆 Date:* ${currentDate}\n`;
        alertText += `*📍 Chat:* ${isStatus ? "Status Update" : (isGroup ? "Group" : "Private Chat")}\n\n`;
        const oldText = extractText(original.content);

        if (isDelete) {
            alertText += `*📄 Deleted ${isStatus ? "Status" : "Message"}:* ${oldText || "_[Media Content]_"}\n\n`;
        } else {
            const proto = protocol || messageData.message?.protocolMessage || messageData;
            const newText = extractText(proto.editedMessage || proto);
            
            alertText += `*📄 Original:* ${oldText || "_[Media]_"}\n`;
            alertText += `*📝 Edited To:* ${newText || "_[Non-text edit]_"}\n\n`;
        }
        const botName = settings.botName || "Nexus-MD";
        alertText += `> *${botName} Protection*`;

        // 6. Dispatch Notification (STRICTLY SUDO/OWNER DM ONLY)
        const primaryOwner = toJid(process.env.SUDO || ownerNumbers[0]);
        
        if (primaryOwner && !primaryOwner.endsWith("@g.us")) {
            try {
                const mentions = [sender];
                if (original.mediaPath && fs.existsSync(original.mediaPath)) {
                    // Extract inner message type for correct media type identification
                    const content = original.content;
                    const realType = content.viewOnceMessageV2?.message ? Object.keys(content.viewOnceMessageV2.message)[0] :
                                     (content.viewOnceMessage?.message ? Object.keys(content.viewOnceMessage?.message)[0] :
                                     original.messageType);
                                     
                    let mediaObj = {};
                    if (realType === "imageMessage") mediaObj = { image: { url: original.mediaPath } };
                    else if (realType === "videoMessage") mediaObj = { video: { url: original.mediaPath } };
                    else if (realType === "audioMessage") mediaObj = { audio: { url: original.mediaPath }, mimetype: "audio/mp4" };
                    else if (realType === "stickerMessage") mediaObj = { sticker: { url: original.mediaPath } };
                    
                    if (Object.keys(mediaObj).length > 0) {
                        await sock.sendMessage(primaryOwner, { ...mediaObj, caption: alertText, mentions });
                    } else {
                        await sock.sendMessage(primaryOwner, { text: alertText, mentions });
                    }
                } else {
                    await sock.sendMessage(primaryOwner, { text: alertText, mentions });
                }
            } catch (e) {
                console.error(`[Anti-Log] ❌ Delivery failed to ${primaryOwner}:`, e.message);
            }
        }
    } catch (err) {
        console.error("⚠️ handleMessageDeleteOrEdit Error:", err);
    }
};

/**
 * Specific handler for message deletions (Anti-Delete)
 * Triggered from index.js via messages.update (backward compatibility)
 */
const handleMessageDelete = async (sock, updates) => {
    try {
        for (const u of updates) {
            await handleMessageDeleteOrEdit(sock, u, false);
        }
    } catch (err) {
        console.error("⚠️ handleMessageDelete Error:", err);
    }
};

module.exports = { handleAutomation, handleMessageDelete, handleMessageDeleteOrEdit, isFamiliar };
