const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { isOwner } = require("../../lib/middleware");

module.exports = {
    name: "sharestatus",
    aliases: ["status2group", "sw2group", "statustogroup", "poststatustogroup"],
    description: "Share/forward a WhatsApp status or message to group chats.",
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

        if (!isGroup && !isBroadcastAll) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Please use this command inside a group, or use `.sharestatus all` to broadcast to all groups." 
            }, { quoted: msg });
        }

        // 1. Identify Quoted Status or Message
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo;

        const quoted = contextInfo?.quotedMessage;
        const customText = isBroadcastAll ? args.slice(1).join(" ") : args.join(" ");

        if (!quoted && !customText) {
            return await sock.sendMessage(jid, {
                text: "❓ *Usage:*\n" +
                      "▸ Reply to any **Status** or **Message** with `.sharestatus` (or `.sw2group`)\n" +
                      "▸ Reply with `.sharestatus <custom caption>` to add your custom note\n" +
                      "▸ Type `.sharestatus <text>` to post a text status update to the group\n" +
                      "▸ Owner: `.sharestatus all` to broadcast status to all groups"
            }, { quoted: msg });
        }

        await sock.sendPresenceUpdate("composing", jid);
        const waitMsg = await sock.sendMessage(jid, { text: "⏳ *Preparing status update for sharing...*" }, { quoted: msg });

        try {
            let mediaBuffer = null;
            let mediaType = "text";
            let originalCaption = "";

            if (quoted) {
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
            if (isBroadcastAll) {
                const groupsMap = await sock.groupFetchAllParticipating().catch(() => ({}));
                targetJids = Object.keys(groupsMap);
            } else {
                targetJids = [jid];
            }

            if (targetJids.length === 0) {
                return await sock.sendMessage(jid, { text: "❌ No group chats found to share status." }, { quoted: msg });
            }

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

            if (isBroadcastAll) {
                await sock.sendMessage(jid, { 
                    text: `✅ *Status Broadcast Complete:* Successfully shared to *${successCount}/${targetJids.length}* groups.` 
                }, { edit: waitMsg.key });
            } else {
                await sock.sendMessage(jid, { 
                    text: `✅ *Status shared to group successfully!*` 
                }, { edit: waitMsg.key });
            }
        } catch (err) {
            console.error("❌ Sharestatus error:", err);
            await sock.sendMessage(jid, { 
                text: `❌ *Failed to share status:* ${err.message}` 
            }, { edit: waitMsg.key });
        }
    }
};
