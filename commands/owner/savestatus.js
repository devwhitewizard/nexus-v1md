const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { toJid } = require("../../lib/utils");
const { ownerNumbers } = require("../../config");

module.exports = {
    name: "savestatus",
    aliases: ["save", "sv", "sw", "statusdownload", "saveviewonce"],
    description: "Save/download a quoted WhatsApp status, view-once, or media message directly to Owner DM.",
    category: "owner",
    isOwnerOnly: true,
    cooldown: 3000,
    execute: async (ctx) => {
        const { sock, jid, msg, sender } = ctx;

        // 1. Identify Quoted Status or Message
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo ||
                            msg.message?.audioMessage?.contextInfo ||
                            msg.message?.documentMessage?.contextInfo;

        const quoted = contextInfo?.quotedMessage;

        if (!quoted) {
            return await sock.sendMessage(jid, {
                text: "❓ *Usage:*\n" +
                      "▸ Reply to any **WhatsApp Status** or **View-Once Message** with `.save` (or `.sv`, `.savestatus`)\n" +
                      "▸ The bot will extract and send the status image, video, audio, or text directly to your Owner DM!"
            }, { quoted: msg });
        }

        // Determine Owner DM destination JID
        const primaryOwner = process.env.SUDO || ownerNumbers[0];
        const targetDmJid = primaryOwner ? toJid(primaryOwner) : sender;

        try {
            await sock.sendPresenceUpdate("composing", jid);

            // Un-wrap nested message structures (viewOnce, documentWithCaption, etc.)
            let m = quoted;
            if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message || m.viewOnceMessageV2;
            else if (m.viewOnceMessage) m = m.viewOnceMessage.message || m.viewOnceMessage;
            else if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message || m.documentWithCaptionMessage;

            let mediaType = "text";
            let caption = "";
            let senderNum = (contextInfo.participant || "").split("@")[0].split(":")[0] || "";

            if (m.imageMessage) {
                mediaType = "image";
                caption = m.imageMessage.caption || "";
            } else if (m.videoMessage) {
                mediaType = "video";
                caption = m.videoMessage.caption || "";
            } else if (m.audioMessage) {
                mediaType = "audio";
            } else if (m.documentMessage) {
                mediaType = "document";
                caption = m.documentMessage.caption || m.documentMessage.fileName || "";
            } else if (m.conversation || m.extendedTextMessage?.text) {
                mediaType = "text";
                caption = m.conversation || m.extendedTextMessage?.text || "";
            }

            const settings = require("../../lib/settings").getSettings();
            const botName = settings.botName || "Nexus-MD";

            let headerCaption = `📥 *SAVED STATUS REPORT* 📥\n`;
            headerCaption += `━━━━━━━━━━━━━━━━━━━\n\n`;
            if (caption) headerCaption += `${caption}\n\n`;
            if (senderNum) headerCaption += `👤 *From:* @${senderNum}\n\n`;
            headerCaption += `> *${botName} Protection & Status Saver*`;

            const mentions = senderNum ? [`${senderNum}@s.whatsapp.net`] : [];

            // If it's pure text status
            if (mediaType === "text") {
                await sock.sendMessage(targetDmJid, { text: headerCaption, mentions });
                if (jid !== targetDmJid) {
                    await sock.sendMessage(jid, { text: "✅ *Status Saved!* Text status sent to owner DM. 📥" }, { quoted: msg });
                }
                return;
            }

            // Download media for image, video, audio, document
            const fakeMsg = {
                key: {
                    remoteJid: jid,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: m
            };

            const mediaBuffer = await downloadMediaMessage(fakeMsg, "buffer", {}).catch((err) => {
                console.error("⚠️ Media download error in savestatus:", err.message);
                return null;
            });

            if (!mediaBuffer) {
                return await sock.sendMessage(jid, { 
                    text: `❌ *Failed to download status media.*\n\n${caption ? `*Status Text:* ${caption}` : ""}` 
                }, { quoted: msg });
            }

            // Send extracted status media to Owner DM
            if (mediaType === "image") {
                await sock.sendMessage(targetDmJid, { 
                    image: mediaBuffer, 
                    caption: headerCaption, 
                    mentions 
                });
            } else if (mediaType === "video") {
                await sock.sendMessage(targetDmJid, { 
                    video: mediaBuffer, 
                    mimetype: "video/mp4", 
                    caption: headerCaption, 
                    mentions 
                });
            } else if (mediaType === "audio") {
                await sock.sendMessage(targetDmJid, { text: headerCaption, mentions });
                await sock.sendMessage(targetDmJid, { 
                    audio: mediaBuffer, 
                    mimetype: "audio/mp4", 
                    ptt: false 
                });
            } else if (mediaType === "document") {
                const fileName = m.documentMessage?.fileName || "saved_status_file";
                const mimetype = m.documentMessage?.mimetype || "application/octet-stream";
                await sock.sendMessage(targetDmJid, { 
                    document: mediaBuffer, 
                    mimetype, 
                    fileName, 
                    caption: headerCaption, 
                    mentions 
                });
            }

            // Acknowledge in chat
            if (jid !== targetDmJid) {
                await sock.sendMessage(jid, { text: "✅ *Status Saved!* Media sent directly to owner DM. 📥" }, { quoted: msg });
            }

            try { await sock.sendMessage(jid, { react: { text: "📥", key: msg.key } }); } catch {}
        } catch (err) {
            console.error("❌ Savestatus Error:", err);
            await sock.sendMessage(jid, { text: `❌ *Failed to save status:* ${err.message}` }, { quoted: msg });
        }
    }
};
