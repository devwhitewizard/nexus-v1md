const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");

module.exports = {
    name: "botpic",
    aliases: ["setbotpic", "setbotpp", "botpp"],
    description: "Update the profile picture of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg, args } = ctx;
        
        let buffer;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const mime = (quoted?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage)?.mimetype || "";

        if (/image/.test(mime)) {
            try {
                await sock.sendMessage(jid, { text: "⏳ Downloading image..." }, { quoted: msg });
                buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer",
                    {},
                    { logger: console }
                );
            } catch (err) {
                return await sock.sendMessage(jid, { text: "❌ Failed to download quoted image." }, { quoted: msg });
            }
        } else if (args[0] && args[0].startsWith("http")) {
            try {
                await sock.sendMessage(jid, { text: "⏳ Fetching image from URL..." }, { quoted: msg });
                const res = await axios.get(args[0], { responseType: 'arraybuffer' });
                buffer = Buffer.from(res.data, 'binary');
            } catch (err) {
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch image from URL." }, { quoted: msg });
            }
        } else {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Please reply to an image or provide a direct image URL.\n\n*Usage:*\n▸ Reply to an image with `.botpic`\n▸ `.botpic https://example.com/pic.jpg`" 
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { text: "⏳ Updating bot profile picture..." }, { quoted: msg });
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            await sock.updateProfilePicture(botJid, buffer);
            await sock.sendMessage(jid, { text: "✅ Bot profile picture updated successfully!" }, { quoted: msg });
        } catch (err) {
            console.error("Profile picture update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update profile picture: ${err.message}` }, { quoted: msg });
        }
    }
};
