const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { isOwner } = require("../../lib/middleware");

module.exports = {
    name: "sharestatus",
    aliases: ["status2group", "sw2group", "statustogroup", "poststatustogroup", "sharestat"],
    description: "Share/post a status update to groups where the bot is present and broadcast to member status feeds.",
    category: "group",
    cooldown: 5000,
    execute: async (ctx) => {
        const { sock, jid, msg, args, isGroup, sender } = ctx;

        const isBroadcastAll = args[0]?.toLowerCase() === "all";

        if (isBroadcastAll && !isOwner(sender)) {
            return await sock.sendMessage(jid, { 
                text: "❌ *Access Denied:* Broadcasting status to ALL groups is restricted to the bot owner." 
            }, { quoted: msg });
        }

        // 1. Identify Quoted Status or Message / Direct Media
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo ||
                            msg.message?.audioMessage?.contextInfo;

        const quoted = contextInfo?.quotedMessage;
        const directMsg = msg.message?.imageMessage || msg.message?.videoMessage;
        const customText = isBroadcastAll ? args.slice(1).join(" ") : args.join(" ");

        if (!quoted && !directMsg && !customText) {
            // Fetch available groups to display helpful usage
            const groupsMap = await sock.groupFetchAllParticipating().catch(() => ({}));
            const groupsList = Object.values(groupsMap);
            
            let usageText = "❓ *Usage:* `.sharestatus` (Usable in Groups & PM!)\n" +
                  "━━━━━━━━━━━━━━━━━━━\n" +
                  "▸ Reply to any **Status** or **Message** with `.sharestatus`\n" +
                  "▸ Reply with `.sharestatus <custom caption>` to include a custom note\n" +
                  "▸ Type `.sharestatus <text>` to post a text status update\n" +
                  "▸ In PM: `.sharestatus <group name>` or reply with `.sharestatus` to post\n" +
                  "▸ Owner: `.sharestatus all` to post to all groups\n\n";
            
            if (groupsList.length > 0) {
                usageText += `👥 *Groups with Bot (${groupsList.length}):*\n`;
                groupsList.slice(0, 5).forEach((g, idx) => {
                    usageText += `  ${idx + 1}. *${g.subject}*\n`;
                });
                if (groupsList.length > 5) usageText += `  ...and ${groupsList.length - 5} more.\n`;
            } else {
                usageText += `⚠️ *Note:* Bot is currently not in any group. Add the bot to a group to share status to group members.`;
            }

            return await sock.sendMessage(jid, { text: usageText }, { quoted: msg });
        }

        await sock.sendPresenceUpdate("composing", jid);
        const waitMsg = await sock.sendMessage(jid, { text: "⏳ *Preparing status update for sharing...*" }, { quoted: msg });

        try {
            let mediaBuffer = null;
            let mediaType = "text";
            let originalCaption = "";

            if (directMsg) {
                mediaType = msg.message?.imageMessage ? "image" : "video";
                originalCaption = directMsg.caption || "";
                try {
                    mediaBuffer = await downloadMediaMessage(msg, "buffer", {});
                } catch (dlErr) {
                    console.error("⚠️ Failed to download direct media:", dlErr.message);
                }
            } else if (quoted) {
                if (quoted.imageMessage) {
                    mediaType = "image";
                    originalCaption = quoted.imageMessage.caption || "";
                } else if (quoted.videoMessage) {
                    mediaType = "video";
                    originalCaption = quoted.videoMessage.caption || "";
                } else if (quoted.audioMessage) {
                    mediaType = "audio";
                } else if (quoted.conversation || quoted.extendedTextMessage?.text) {
                    mediaType = "text";
                    originalCaption = quoted.conversation || quoted.extendedTextMessage?.text || "";
                }

                if (mediaType !== "text") {
                    try {
                        const fakeMsg = {
                            key: {
                                remoteJid: jid,
                                id: contextInfo.stanzaId,
                                participant: contextInfo.participant
                            },
                            message: quoted
                        };
                        mediaBuffer = await downloadMediaMessage(fakeMsg, "buffer", {});
                    } catch (dlErr) {
                        console.error("⚠️ Failed to download quoted media:", dlErr.message);
                    }
                }
            }

            const captionText = customText || originalCaption;

            // Formatted Header
            let statusBody = `📱 *SHARED STATUS UPDATE* 📱\n`;
            statusBody += `━━━━━━━━━━━━━━━━━━━\n\n`;
            if (captionText) statusBody += `${captionText}\n\n`;
            const settings = require("../../lib/settings").getSettings();
            const botName = settings.botName || "Nexus-MD";
            statusBody += `> *${botName} Status Sharing*`;

            // Determine Target Group JIDs
            let targetJids = [];
            const allGroupsMap = await sock.groupFetchAllParticipating().catch(() => ({}));
            const allGroups = Object.values(allGroupsMap);

            if (isBroadcastAll) {
                targetJids = allGroups.map(g => g.id);
            } else if (isGroup) {
                targetJids = [jid];
            } else {
                // In DM/PM mode: find target group(s)
                if (args.length > 0) {
                    const query = args.join(" ").toLowerCase();
                    const matchedGroup = allGroups.find(g => g.subject.toLowerCase().includes(query) || g.id === query);
                    if (matchedGroup) {
                        targetJids = [matchedGroup.id];
                    }
                }
                
                // If no specific group matched or supplied in DM, target all participating groups
                if (targetJids.length === 0) {
                    if (allGroups.length > 0) {
                        targetJids = allGroups.map(g => g.id);
                    }
                }
            }

            if (targetJids.length === 0) {
                return await sock.sendMessage(jid, { 
                    text: "❌ *No eligible groups found:* The bot must be a member of at least one group chat." 
                }, { edit: waitMsg.key });
            }

            // Collect all member JIDs across target groups so they see the status in WhatsApp status feed
            let memberJidsSet = new Set();
            for (const tJid of targetJids) {
                const grpMeta = allGroupsMap[tJid] || await sock.groupMetadata(tJid).catch(() => null);
                if (grpMeta && grpMeta.participants) {
                    grpMeta.participants.forEach(p => {
                        if (p.id) memberJidsSet.add(p.id);
                    });
                }
            }
            const memberJids = Array.from(memberJidsSet);

            // 1. Post to WhatsApp Status Feed (status@broadcast) targeting group members
            let postedToStatusFeed = false;
            if (memberJids.length > 0) {
                try {
                    if (mediaType === "image" && mediaBuffer) {
                        await sock.sendMessage("status@broadcast", { image: mediaBuffer, caption: statusBody }, { statusJidList: memberJids });
                    } else if (mediaType === "video" && mediaBuffer) {
                        await sock.sendMessage("status@broadcast", { video: mediaBuffer, mimetype: "video/mp4", caption: statusBody }, { statusJidList: memberJids });
                    } else if (mediaType === "audio" && mediaBuffer) {
                        await sock.sendMessage("status@broadcast", { audio: mediaBuffer, mimetype: "audio/mp4", ptt: true }, { statusJidList: memberJids });
                    } else {
                        await sock.sendMessage("status@broadcast", { text: statusBody, backgroundColor: "#128C7E", font: 1 }, { statusJidList: memberJids });
                    }
                    postedToStatusFeed = true;
                    console.log(`📡 [SHARESTATUS] Status posted to status@broadcast for ${memberJids.length} members`);
                } catch (statusErr) {
                    console.warn("⚠️ Failed to post status@broadcast:", statusErr.message);
                }
            }

            // 2. Post directly into target Group Chat(s)
            let successCount = 0;

            for (const targetJid of targetJids) {
                try {
                    if (mediaType === "image" && mediaBuffer) {
                        await sock.sendMessage(targetJid, { image: mediaBuffer, caption: statusBody });
                    } else if (mediaType === "video" && mediaBuffer) {
                        await sock.sendMessage(targetJid, { video: mediaBuffer, mimetype: "video/mp4", caption: statusBody });
                    } else if (mediaType === "audio" && mediaBuffer) {
                        if (captionText) {
                            await sock.sendMessage(targetJid, { text: statusBody });
                        }
                        await sock.sendMessage(targetJid, { audio: mediaBuffer, mimetype: "audio/mp4", ptt: true });
                    } else {
                        await sock.sendMessage(targetJid, { text: statusBody });
                    }
                    successCount++;
                } catch (sendErr) {
                    console.error(`⚠️ Failed to send status to ${targetJid}:`, sendErr.message);
                }
            }

            let responseMsg = `✅ *Status shared successfully!*\n\n`;
            responseMsg += `📱 *Target Groups:* ${successCount}/${targetJids.length}\n`;
            responseMsg += `👥 *Group Members Targeted:* ${memberJids.length}\n`;
            if (postedToStatusFeed) responseMsg += `📡 *WhatsApp Status Feed:* Posted story for group members!`;

            await sock.sendMessage(jid, { text: responseMsg }, { edit: waitMsg.key });

        } catch (err) {
            console.error("❌ Sharestatus error:", err);
            await sock.sendMessage(jid, { 
                text: `❌ *Failed to share status:* ${err.message}` 
            }, { edit: waitMsg.key });
        }
    }
};

