const { saveMessage, getMessage } = require("./messageModel");
const { getSettings } = require("./settings");
const { ownerNumbers } = require("../config");
const { getAfk, removeAfk } = require("./afk");
const fs = require("fs");

/**
 * Handles all background automation (Anti-Delete, Auto-Status, etc.)
 */
const handleAutomation = async (sock, m) => {
    try {
        const settings = getSettings();
        const jid = m.key.remoteJid;

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
            const emojis = settings.statusLikeEmojis.split(",");
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await sock.sendMessage("status@broadcast", {
                react: { text: randomEmoji.trim(), key: m.key }
            }, { statusJidList: [m.key.participant] });
            console.log(`❤️ Status liked with ${randomEmoji} from: ${m.pushName}`);
        }

        // C. Auto Reply
        if (settings.autoReplyStatus) {
            await sock.sendMessage(m.key.participant, { 
                text: settings.statusReplyText 
            }, { quoted: m });
            console.log(`💬 Auto-replied to status from: ${m.pushName}`);
        }
        return; // Don't log status messages to DB
    }

    if (!m.message) return;

    // A. AFK Mention Detection
    const sender = m.key.participant || m.key.remoteJid;
    const mentionedJids = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    for (const mentioned of mentionedJids) {
        if (afk && !isGroup) { // Only reply in DMs to avoid group noise
            await sock.sendMessage(jid, { 
                text: `🤫 *@${mentioned.split("@")[0]}* is currently AFK!\n📝 *Reason:* ${afk.reason}\n⏳ *Since:* ${new Date(afk.time).toLocaleTimeString()}`,
                mentions: [mentioned]
            }, { quoted: m });
        }
    }

    // B. AFK Removal Detection
    if (getAfk(jid, sender) && !isGroup) { // Only reply in DMs
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
        // Need to re-fetch to get the mediaPath from saveMessage (it returns the row)
        // Actually saveMessage didn't return it yet, let's fix that too.
        // For now, let's just use the message from the log.
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
            const sender = m.key.participant || m.key.remoteJid;
            if (groupMetadata) {
                const groupAdmins = groupMetadata.participants.filter(p => p.admin || p.isSuperAdmin).map(p => p.id);
                if (!groupAdmins.includes(sender)) {
                    await sock.sendMessage(jid, { delete: m.key });
                    // Only send warning if bot owner or admin is the one typing? No, just silence it for cleaner groups.
                    // Or send to Owner DM.
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
            console.log(`🚫 Anti-Badword: Deleting offensive message from ${m.key.participant}`);
            await sock.sendMessage(jid, { delete: m.key });
            return;
        }
    }

    // 6. Anti-Spam Protection
    if (isGroup && settings.antiSpam && !m.key.fromMe) {
        const { isOwner, isAdmin } = require("./middleware");
        if (isOwner(sender) || isAdmin(sender)) return; // Don't flag admins/owners
        
        if (!global.spamTracker) global.spamTracker = {};
        const sender = m.key.participant || m.key.remoteJid;
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
 * Specific handler for message deletions (Anti-Delete)
 * Triggered from index.js via messages.update
 */
const handleMessageDelete = async (sock, updates) => {
    try {
        const settings = getSettings();
        
        for (const u of updates) {
            const updateData = u.update;
            const key = u.key;
            if (!updateData || !key) continue;

            // 📍 DEEP DEBUG (Will help us see why it's failing)
            console.log(`[Anti-Debug] Update for ${key.id} | HasMsg: ${!!updateData.message} | Stub: ${u.messageStubType}`);
            
            // 1. Identification
            const protocol = updateData.protocolMessage || updateData.message?.protocolMessage;
            const stubType = u.messageStubType;

            let isDelete = (protocol?.type === 0 || protocol?.type === 3);
            let isEdit = (protocol?.type === 14);
            let targetId = protocol?.key?.id; // Edits/Deletes carry the original ID here

            // Fallback for Stub revocations (Type 1 is usually REVOKE)
            if (!isDelete && (stubType === 1 || stubType === 68)) {
                isDelete = true;
                targetId = key.id;
            }

            if (!targetId) continue;
            
            console.log(`[Anti-Debug] Detected ${isDelete ? "DELETE" : isEdit ? "EDIT" : "UNKNOWN"} for ID: ${targetId}`);

            // 2. Fetch original from DB & Format Report
            if ((isDelete && settings.antiDelete) || (isEdit && settings.antiEdit)) {
                const original = await getMessage(targetId);

                if (!original) continue;

                const sender = original.participant || original.remoteJid;
                const senderNum = sender.split("@")[0];
                const isGroup = original.remoteJid.endsWith("@g.us");
                
                const label = isDelete ? "*🕵️ ANTI-DELETE REPORT*" : "*✏️ ANTI-EDIT REPORT*";
                const timeZone = "Africa/Nairobi";
                const currentTime = new Date().toLocaleTimeString("en-GB", { timeZone });
                const currentDate = new Date().toLocaleDateString("en-GB", { timeZone });
                
                // Original time from database
                const origTime = new Date(original.timestamp * 1000).toLocaleTimeString("en-GB", { timeZone });

                let alertText = `${label}\n\n`;
                alertText += `*👤 User:* @${senderNum}\n`;
                alertText += `*🕙 Orig Time:* ${origTime}\n`;
                alertText += `*🕒 ${isDelete ? "Delete" : "Edit"} Time:* ${currentTime}\n`;
                alertText += `*📆 Date:* ${currentDate}\n`;
                alertText += `*📍 Chat:* ${isGroup ? "Group" : "Private Chat"}\n\n`;

                const extractText = (msg) => {
                    if (!msg) return "";
                    // Support Baileys multiple message formats
                    const m = msg.editedMessage || msg.message || msg;
                    return m.conversation || 
                           m.extendedTextMessage?.text || 
                           m.imageMessage?.caption || 
                           m.videoMessage?.caption || 
                           m.documentWithCaptionMessage?.message?.documentMessage?.caption || 
                           (typeof m === "string" ? m : "");
                };

                const oldText = extractText(JSON.parse(original.content));

                if (isDelete) {
                    alertText += `*📄 Deleted Message:* ${oldText || "_[Media Content]_"}\n\n`;
                } else {
                    const proto = protocol || updateData.message?.protocolMessage;
                    const newText = extractText(proto.editedMessage || proto);
                    
                    alertText += `*📄 Original:* ${oldText || "_[Media]_"}\n`;
                    alertText += `*📝 Edited To:* ${newText || "_[Non-text edit]_"}\n\n`;
                }
                alertText += `> *Nexus-1MD Protection*`;


                // 3. Dispatch Notification (STRICTLY SUDO/OWNER DM ONLY)
                const { toJid } = require("./utils");
                const primaryOwner = toJid(process.env.SUDO || ownerNumbers[0]);
                
                if (primaryOwner && !primaryOwner.endsWith("@g.us")) {
                    try {
                        const mentions = [sender];
                        if (original.mediaPath && fs.existsSync(original.mediaPath)) {
                            const mediaType = original.messageType;
                            let mediaObj = {};
                            if (mediaType === "imageMessage") mediaObj = { image: { url: original.mediaPath } };
                            else if (mediaType === "videoMessage") mediaObj = { video: { url: original.mediaPath } };
                            else if (mediaType === "audioMessage") mediaObj = { audio: { url: original.mediaPath }, mimetype: "audio/mp4" };
                            else if (mediaType === "stickerMessage") mediaObj = { sticker: { url: original.mediaPath } };
                            
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
            }
        }
    } catch (err) {
        console.error("⚠️ handleMessageDelete Error:", err);
    }
};






module.exports = { handleAutomation, handleMessageDelete };
