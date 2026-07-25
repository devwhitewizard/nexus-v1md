const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "copy",
    description: "Copy and resend the quoted message",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return await sock.sendMessage(jid, { text: "⚠️ Please reply to the message you want to copy." }, { quoted: msg });
        }

        try {
            // 1. Text message
            const textContent = quoted.conversation || quoted.extendedTextMessage?.text;
            if (textContent) {
                return await sock.sendMessage(jid, { text: textContent });
            }

            // 2. Media message
            const imageMsg = quoted.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage || quoted.viewOnceMessage?.message?.imageMessage;
            const videoMsg = quoted.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage || quoted.viewOnceMessage?.message?.videoMessage;
            const audioMsg = quoted.audioMessage;
            const documentMsg = quoted.documentMessage;
            const stickerMsg = quoted.stickerMessage;

            const mediaMsg = imageMsg || videoMsg || audioMsg || documentMsg || stickerMsg;
            if (mediaMsg) {
                const buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer",
                    {},
                    { logger: console }
                );

                const caption = mediaMsg.caption || "";

                if (imageMsg) {
                    return await sock.sendMessage(jid, { image: buffer, caption });
                } else if (videoMsg) {
                    return await sock.sendMessage(jid, { video: buffer, caption });
                } else if (audioMsg) {
                    const ptt = !!audioMsg.ptt;
                    return await sock.sendMessage(jid, { audio: buffer, ptt, mimetype: audioMsg.mimetype });
                } else if (documentMsg) {
                    return await sock.sendMessage(jid, { document: buffer, mimetype: documentMsg.mimetype, fileName: documentMsg.fileName });
                } else if (stickerMsg) {
                    return await sock.sendMessage(jid, { sticker: buffer });
                }
            }

            // 3. Fallback
            return await sock.sendMessage(jid, { text: "⚠️ Unsupported message type to copy." }, { quoted: msg });
        } catch (error) {
            console.error("❌ Copy Command Error:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to copy message." }, { quoted: msg });
        }
    }
};
