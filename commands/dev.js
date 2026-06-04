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

        await sock.sendMessage(jid, { 
            text,
            contextInfo: {
                externalAdReply: {
                    title: "WHITE WIZARD",
                    body: "I Like Coding! 💻🚀",
                    thumbnail: fs.readFileSync(path.join(__dirname, "../assets/Nexuspic.png")),
                    sourceUrl: "https://jonathanmwanza.vercel.app/",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};
