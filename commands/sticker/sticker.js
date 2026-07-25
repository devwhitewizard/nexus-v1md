const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "sticker",
    aliases: ["s", "stik", "tosticker"],
    description: "Convert image or video to sticker",
    category: "sticker",
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const mime = (quoted?.imageMessage || quoted?.videoMessage || quoted?.viewOnceMessageV2?.message?.imageMessage || quoted?.viewOnceMessageV2?.message?.videoMessage)?.mimetype || "";

        if (!/image|video/.test(mime)) {
            return await sock.sendMessage(jid, { text: "⚠️ Reply to an image or video to create a sticker!" });
        }

        try {
            await sock.sendMessage(jid, { text: "⏳ Creating sticker..." });
            
            // Download the media
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            const sticker = new Sticker(buffer, {
                pack: "Nexus-1MD pack",
                author: "Wizard Bot",
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 70,
                background: "transparent",
            });

            const stickerBuffer = await sticker.toBuffer();
            await sock.sendMessage(jid, { sticker: stickerBuffer });

        } catch (error) {
            console.error("❌ Sticker Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to create sticker. Media might be too large." });
        }
    }
};
