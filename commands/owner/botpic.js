const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { updateSettings } = require("../../lib/settings");

module.exports = {
    name: "botpic",
    aliases: ["setbotpic", "setbotpp", "botpp"],
    description: "Update the WhatsApp profile picture and menu/banner image of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg, args } = ctx;
        
        let buffer;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const mime = (quoted?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage || quoted?.documentWithCaptionMessage?.message?.documentMessage)?.mimetype || "";

        if (/image/.test(mime) || quoted?.imageMessage) {
            try {
                await sock.sendMessage(jid, { text: "⏳ Downloading image..." }, { quoted: msg });
                buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer",
                    {},
                    { logger: console }
                );
            } catch (err) {
                return await sock.sendMessage(jid, { text: `❌ Failed to download image: ${err.message}` }, { quoted: msg });
            }
        } else if (args[0] && args[0].startsWith("http")) {
            try {
                await sock.sendMessage(jid, { text: "⏳ Fetching image from URL..." }, { quoted: msg });
                const res = await axios.get(args[0], { responseType: 'arraybuffer' });
                buffer = Buffer.from(res.data, 'binary');
            } catch (err) {
                return await sock.sendMessage(jid, { text: `❌ Failed to fetch image from URL: ${err.message}` }, { quoted: msg });
            }
        } else {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Please reply to an image, attach an image, or provide a direct image URL.\n\n*Usage:*\n▸ Reply to an image with `.botpic` or `.setbotpp`\n▸ `.botpic https://example.com/pic.jpg`" 
            }, { quoted: msg });
        }

        if (!buffer || buffer.length === 0) {
            return await sock.sendMessage(jid, { text: "❌ Invalid image buffer received." }, { quoted: msg });
        }

        let updatedProfile = false;
        let updatedBanner = false;
        let errors = [];

        // 1. Update WhatsApp Profile Picture
        try {
            await sock.sendMessage(jid, { text: "⏳ Updating WhatsApp profile picture..." }, { quoted: msg });
            const rawBotJid = sock.user?.id || global.myJid || "";
            const botJid = rawBotJid ? (rawBotJid.split(":")[0] + "@s.whatsapp.net") : jid;
            
            await sock.updateProfilePicture(botJid, buffer);
            updatedProfile = true;
        } catch (err) {
            console.error("WhatsApp Profile Picture Update Error:", err);
            errors.push(`WhatsApp Profile Picture: ${err.message || err}`);
        }

        // 2. Update local banner images (Nexuspic.jpg and botnexus.png) & settings
        try {
            const nexusPicPath = path.join(__dirname, "../../assets/Nexuspic.jpg");
            const botNexusPath = path.join(__dirname, "../../assets/botnexus.png");

            fs.writeFileSync(nexusPicPath, buffer);
            fs.writeFileSync(botNexusPath, buffer);
            
            const botImageUrl = (args[0] && args[0].startsWith("http")) ? args[0] : "Local Custom";
            await updateSettings({ botImage: botImageUrl });
            updatedBanner = true;
        } catch (err) {
            console.error("Local Bot Banner Image Update Error:", err);
            errors.push(`Local Banner Image: ${err.message || err}`);
        }

        if (updatedProfile && updatedBanner) {
            await sock.sendMessage(jid, { text: "✅ Bot profile picture and menu/banner image updated successfully!" }, { quoted: msg });
        } else if (updatedProfile) {
            await sock.sendMessage(jid, { text: "✅ Bot WhatsApp profile picture updated successfully! (Local banner update failed)" }, { quoted: msg });
        } else if (updatedBanner) {
            await sock.sendMessage(jid, { text: "✅ Local menu/banner image updated successfully! (WhatsApp profile picture update failed)" }, { quoted: msg });
        } else {
            await sock.sendMessage(jid, { text: `❌ Failed to update bot image:\n${errors.join("\n")}` }, { quoted: msg });
        }
    }
};

