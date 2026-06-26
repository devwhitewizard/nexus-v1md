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
            await sock.sendMessage(jid, { text: "⏳ Updating bot menu/banner image..." }, { quoted: msg });
            
            const path = require("path");
            const fs = require("fs");
            const targetPath = path.join(__dirname, "../assets/Nexuspic.jpg");
            
            // Save the image buffer directly as the bot menu banner
            fs.writeFileSync(targetPath, buffer);
            
            // Update the settings database
            const { updateSettings } = require("../lib/settings");
            const botImageUrl = (args[0] && args[0].startsWith("http")) ? args[0] : "Local Custom";
            await updateSettings({ botImage: botImageUrl });
            
            await sock.sendMessage(jid, { text: "✅ Bot menu/banner image updated successfully!" }, { quoted: msg });
        } catch (err) {
            console.error("Bot image update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update bot image: ${err.message}` }, { quoted: msg });
        }
    }
};
