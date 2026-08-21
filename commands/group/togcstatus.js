const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { isAdmin } = require("../../lib/middleware");
const { toJid } = require("../../lib/utils");
const jsonStore = require("../../nexus/jsonStore");

module.exports = {
    name: "gcstatus",
    aliases: ["togcstatus", "groupstatus", "gcs", "setgcstatus"],
    description: "Post a group status & update group icon (Admins only) or view active status (All members)",
    category: "group",
    isGroupOnly: true,
    isBotAdmin: true,
    execute: async (ctx) => {
        const { sock, jid, msg, args, sender } = ctx;

        // Extract Quoted Message / Context
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo;

        const quoted = contextInfo?.quotedMessage;
        const inputContent = args.join(" ").trim();
        const isPostingAttempt = !!quoted || inputContent.length > 0 || !!msg.message?.imageMessage;

        // ═══════════════════════════════════════════════════════════
        // 1. POST A NEW GROUP STATUS & UPDATE GROUP ICON (Admins Only)
        // ═══════════════════════════════════════════════════════════
        if (isPostingAttempt) {
            const userIsAdmin = await isAdmin(sender, jid, sock);
            if (!userIsAdmin) {
                return await sock.sendMessage(jid, { 
                    text: "❌ *Access Denied:* Only Group Admins can post a status to the group!\n\n_Group members can type `.gcstatus` to view active status updates._" 
                }, { quoted: msg });
            }

            await sock.sendPresenceUpdate("composing", jid);

            let mediaBuffer = null;
            let mediaType = "text";
            let originalCaption = "";

            // Direct attached image/video or quoted message
            const directMsg = msg.message?.imageMessage || msg.message?.videoMessage;
            
            if (directMsg) {
                mediaType = msg.message?.imageMessage ? "image" : "video";
                originalCaption = directMsg.caption || "";
                try {
                    mediaBuffer = await downloadMediaMessage(msg, "buffer", {});
                } catch (dlErr) {
                    console.error("⚠️ Failed to download direct media for gcstatus:", dlErr.message);
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
                        console.error("⚠️ Failed to download quoted media for gcstatus:", dlErr.message);
                    }
                }
            }

            // Attempt to update Group Icon if an image is provided
            let iconUpdated = false;
            if (mediaType === "image" && mediaBuffer) {
                try {
                    await sock.updateProfilePicture(jid, mediaBuffer);
                    iconUpdated = true;
                    console.log(`🖼️ Group profile picture updated for ${jid}`);
                } catch (iconErr) {
                    console.warn(`⚠️ Could not update group profile picture: ${iconErr.message}`);
                }
            }

            const statusText = inputContent || originalCaption;
            const adminNum = sender.split("@")[0].split(":")[0];
            const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

            let statusBody = `🌟 *GROUP STATUS UPDATE* 🌟\n`;
            statusBody += `━━━━━━━━━━━━━━━━━━━\n\n`;
            if (statusText) statusBody += `${statusText}\n\n`;
            statusBody += `👤 *Posted By Admin:* @${adminNum}\n`;
            statusBody += `⌚ *Time:* ${timeStr}\n`;
            if (iconUpdated) statusBody += `🖼️ *Group Icon:* Updated with status photo!\n`;
            statusBody += `\n> *Members can type .gcstatus anytime to view this status*`;

            try {
                let sentMsg = null;
                const mentions = [sender];

                if (mediaType === "image" && mediaBuffer) {
                    sentMsg = await sock.sendMessage(jid, { 
                        image: mediaBuffer, 
                        caption: statusBody, 
                        mentions 
                    }, { quoted: msg });
                } else if (mediaType === "video" && mediaBuffer) {
                    sentMsg = await sock.sendMessage(jid, { 
                        video: mediaBuffer, 
                        mimetype: "video/mp4", 
                        caption: statusBody, 
                        mentions 
                    }, { quoted: msg });
                } else if (mediaType === "audio" && mediaBuffer) {
                    await sock.sendMessage(jid, { text: statusBody, mentions }, { quoted: msg });
                    sentMsg = await sock.sendMessage(jid, { audio: mediaBuffer, mimetype: "audio/mp4", ptt: true });
                } else {
                    sentMsg = await sock.sendMessage(jid, { text: statusBody, mentions }, { quoted: msg });
                }

                // Save active status to jsonStore for this group
                const statusStoreKey = `gcstatus_${jid}`;
                const activeStatus = {
                    text: statusBody,
                    adminNum,
                    postedAt: Date.now(),
                    mediaType,
                    hasMedia: !!mediaBuffer,
                    iconUpdated
                };
                jsonStore.set(statusStoreKey, activeStatus);

                console.log(`✅ [GCSTATUS] New status posted in ${jid} by admin @${adminNum}`);
            } catch (err) {
                console.error("❌ gcstatus post error:", err);
                await sock.sendMessage(jid, { text: `❌ Failed to post group status: ${err.message}` }, { quoted: msg });
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // 2. VIEW ACTIVE GROUP STATUS (All Members & Admins)
        // ═══════════════════════════════════════════════════════════
        const statusStoreKey = `gcstatus_${jid}`;
        const currentStatus = jsonStore.get(statusStoreKey, null);

        if (!currentStatus) {
            return await sock.sendMessage(jid, { 
                text: "ℹ️ *No active group status found.*\n\n_Group Admins can post a status update by sending/replying to a photo with `.gcstatus` or typing `.gcstatus <message>`._" 
            }, { quoted: msg });
        }

        const ageMinutes = Math.floor((Date.now() - (currentStatus.postedAt || Date.now())) / (1000 * 60));

        let viewText = currentStatus.text;
        viewText += `\n⌛ _Status active (${ageMinutes}m ago)_`;

        const adminJid = toJid(currentStatus.adminNum);

        await sock.sendMessage(jid, { 
            text: viewText,
            mentions: [adminJid]
        }, { quoted: msg });
    }
};
