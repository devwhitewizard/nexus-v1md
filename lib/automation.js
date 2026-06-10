const { saveMessage, getMessage } = require("./messageModel");
const { getSettings } = require("./settings");
const { ownerNumbers } = require("../config");
const { getAfk, removeAfk } = require("./afk");
const fs = require("fs");

// Cache to prevent duplicate notifications for deletes/edits
const processedEvents = new Set();


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

        // 1. Presence Logic (Typing/Recording) - ⏳ THROTTLED (15s)
        if (m.message && !m.key.fromMe) {
            if ((isGroup && settings.groupPresence) || (!isGroup && settings.dmPresence)) {
                if (!global.presenceTracker) global.presenceTracker = {};
                const now = Date.now();
                const last = global.presenceTracker[jid] || 0;
                if (now - last > 15000) { // Only send once every 15 seconds
                    global.presenceTracker[jid] = now;
                    await sock.sendPresenceUpdate("composing", jid);
                }
            }
        }

        // 2. Advanced Auto-Status System (Check this BEFORE m.message guard)
        if (jid === "status@broadcast") {
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
                const emojiStr = settings.statusLikeEmojis || "❤️,✨,🔥,🙌";
                const emojis = typeof emojiStr === "string" ? emojiStr.split(",") : ["❤️", "✨", "🔥", "🙌"];
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
        const { toJid } = require("./utils");
        const original = await getMessage(m.key.id);
        if (original && original.mediaPath) {
            for (const rawOwner of [process.env.SUDO || ownerNumbers[0]]) {
                const targetLog = toJid(rawOwner);
                try {
                    const typeLabel = original.messageType.replace("Message", "");
                    const caption = `*👁️ ANTI-VIEW ONCE DETECTED*\n━━━━━━━━━━━━━━━━━━━\n\n👤 *From:* ${m.pushName} (@${sender.split("@")[0]})\n📦 *Type:* ${typeLabel}\n\n> Nexus-1MD Protection`;
                    
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

    // 4. Anti-Link Protection
    if (isGroup && settings.antiLink && !m.key.fromMe) {
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (text.includes("chat.whatsapp.com") || text.includes("wa.me/settings")) {
            const groupMetadata = await sock.groupMetadata(jid).catch(() => null);
            if (groupMetadata) {
                const groupAdmins = groupMetadata.participants.filter(p => p.admin || p.isSuperAdmin).map(p => p.id);
                if (!groupAdmins.includes(sender)) {
                    await sock.sendMessage(jid, { delete: m.key });
                }
            }
        }
    }

    // 5. Anti-Badword Protection
    if (isGroup && settings.antiBadword && !m.key.fromMe) {
        const { getBadwords } = require("../database/badwords");
        const badwords = await getBadwords();
        const text = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").toLowerCase();
        
        if (badwords.some(word => text.includes(word.toLowerCase()))) {
            console.log(`🚫 Anti-Badword: Deleting offensive message from ${sender}`);
            await sock.sendMessage(jid, { delete: m.key });
            return;
        }
    }

    // 6. Anti-Spam Protection
    if (isGroup && settings.antiSpam && !m.key.fromMe) {
        const { isOwner, isAdmin } = require("./middleware");
        if (isOwner(sender) || isAdmin(sender)) return; // Don't flag admins/owners
        
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
        
        console.log(`[Anti-Debug] handleMessageDeleteOrEdit triggered for key ID: ${key?.id}, isUpsert: ${isUpsert}`);

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

        if (!targetId) {
            console.log(`[Anti-Debug] No targetId resolved. Skipping.`);
            return;
        }
        
        console.log(`[Anti-Debug] targetId determined: ${targetId}, isDelete: ${isDelete}, isEdit: ${isEdit}`);

        // 2. Deduplication using processedEvents Set
        const eventKey = isDelete 
            ? `delete_${targetId}` 
            : `edit_${targetId}_${JSON.stringify(protocol?.editedMessage || messageData.editedMessage || messageData.message || "")}`;
            
        if (processedEvents.has(eventKey)) {
            console.log(`[Anti-Debug] Event already processed. Deduplicated key: ${eventKey}`);
            return;
        }
        
        console.log(`[Anti-Debug] Deduplication check passed for eventKey: ${eventKey}`);
        
        // 3. Fetch original message from DB
        const original = await getMessage(targetId);
        if (!original) {
            console.log(`[Anti-Debug] Original message not found in DB/cache for targetId: ${targetId}`);
            return;
        }
        
        console.log(`[Anti-Debug] Original message found. Content keys: ${Object.keys(original.content || {})}`);

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
            console.log(`[Anti-Debug] Decrypted edit verification: oldText: "${oldText}", newText: "${newText}"`);
            
            if (oldText && newText && oldText !== newText) {
                isEdit = true;
            } else {
                console.log(`[Anti-Debug] Decrypted edit verification failed (same or empty text).`);
                return; // Not a verified edit with text change
            }
        }

        processedEvents.add(eventKey);
        
        // Limit cache size to 1000
        if (processedEvents.size > 1000) {
            processedEvents.delete(processedEvents.values().next().value);
        }

        const isStatus = original.remoteJid === "status@broadcast";
        console.log(`[Anti-Debug] Settings check: isStatus: ${isStatus}, antiDelete: ${settings.antiDelete}, antiEdit: ${settings.antiEdit}, statusAntiDelete: ${settings.statusAntiDelete}`);
        
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
        alertText += `> *Nexus-1MD Protection*`;

        // 6. Dispatch Notification (STRICTLY SUDO/OWNER DM ONLY)
        const { toJid } = require("./utils");
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
                console.log(`[Anti-Log] ✅ Report sent strictly to Owner: ${primaryOwner}`);
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

module.exports = { handleAutomation, handleMessageDelete, handleMessageDeleteOrEdit };
