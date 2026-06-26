const fs = require("fs");
const path = require("path");

module.exports = {
    name: "dev",
    aliases: ["developer", "creator", "wizard"],
    description: "Short info about the developer.",
    category: "general",
    execute: async ({ sock, jid, msg }) => {
        const text = `👨‍💻 *THE WIZARD'S PROFILE*\n\n` +
                     `✨ *Name:* White Wizard\n` +
                     `👨‍💻 *Bio:* My passion and only purpose here is coding. I love building tools that make life easier and more fun!\n\n` +
                     `🌐 *Portfolio:* https://jonathanmwanza.vercel.app/\n` +
                     `📂 *GitHub:* https://github.com/devwhitewizard\n\n` +
                     `_\"Magic is just science we don't understand yet, and code is the closest thing to magic I've found.\"_`;

        const { getSettings } = require("../lib/settings");
        const settings = getSettings();
        const botImageUrl = settings.botImage;

        try {
            let banner;
            if (botImageUrl && botImageUrl.startsWith("http")) {
                banner = { url: botImageUrl };
            } else {
                const imgPath = path.join(__dirname, "../assets/Nexuspic.jpg");
                banner = fs.readFileSync(imgPath);
            }
            await sock.sendMessage(jid, { image: banner, caption: text }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(jid, { text }, { quoted: msg });
        }
    }
};
