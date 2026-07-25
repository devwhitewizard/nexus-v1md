const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "toviewonce",
    aliases: ["tovvo"],
    description: "Convert a media message to a view-once message",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage || msg.message;
        
        // Find media message in quoted
        const imageMsg = quoted?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage || quoted?.viewOnceMessage?.message?.imageMessage;
        const videoMsg = quoted?.videoMessage || quoted?.viewOnceMessageV2?.message?.videoMessage || quoted?.viewOnceMessage?.message?.videoMessage;
        
        const mediaMsg = imageMsg || videoMsg;
        const mime = mediaMsg?.mimetype || "";

        if (!/image|video/.test(mime)) {
            return await sock.sendMessage(jid, { text: "⚠️ Please reply to an image or video to convert it to view-once." }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { text: "⏳ Converting to view-once..." }, { quoted: msg });
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            const isImage = !!imageMsg;
            const caption = mediaMsg.caption || "";

            if (isImage) {
                await sock.sendMessage(jid, { image: buffer, caption, viewOnce: true });
            } else {
                await sock.sendMessage(jid, { video: buffer, caption, viewOnce: true });
            }
        } catch (error) {
            console.error("❌ Toviewonce Error:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to convert media to view-once." }, { quoted: msg });
        }
    }
};
