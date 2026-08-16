const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { isAdmin } = require("../../lib/middleware");
const { toJid } = require("../../lib/utils");
const jsonStore = require("../../nexus/jsonStore");

module.exports = {
    name: "gcstatus",
    aliases: ["togcstatus", "groupstatus", "gcs"],
    description: "Post a group status (Admins only) or view active status (All members)",
    category: "group",
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg, args, sender } = ctx;

        // Extract Quoted Message / Context
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo;

        const quoted = contextInfo?.quotedMessage;
        const inputContent = args.join(" ").trim();
        const isPostingAttempt = !!quoted || inputContent.length > 0;

        // ═══════════════════════════════════════════════════════════
        // 1. POST A NEW GROUP STATUS (Group Admins Only)
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
                        console.error("⚠️ Failed to download quoted media for gcstatus:", dlErr.message);
                    }
                }
            }

            const statusText = inputContent || originalCaption;
            const adminNum = sender.split("@")[0].split(":")[0];
            const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

            let statusBody = `🌟 *GROUP STATUS UPDATE* 🌟\n`;
            statusBody += `━━━━━━━━━━━━━━━━━━━\n\n`;
            if (statusText) statusBody += `${statusText}\n\n`;
            statusBody += `👤 *Posted By Admin:* @${adminNum}\n`;
            statusBody += `⌚ *Time:* ${timeStr}\n\n`;
            statusBody += `> *Members can type .gcstatus anytime to view this status*`;

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
                    hasMedia: !!mediaBuffer
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
                text: "ℹ️ *No active group status found.*\n\n_Group Admins can post a status update by replying to a message/media with `.gcstatus` or typing `.gcstatus <message>`._" 
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
