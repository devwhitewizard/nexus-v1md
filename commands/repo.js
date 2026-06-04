const fs = require("fs");
const path = require("path");

module.exports = {
    name: "repo",
    aliases: ["github", "source", "script"],
    description: "Get the bot's source code repository link.",
    category: "general",
    execute: async ({ sock, jid, msg }) => {
        const text = `📂 *NEXUS-1MD SOURCE CODE*\n\n` +
                     `You can get the bot script and deployment guide from the official repository:\n\n` +
                     `🔗 *GitHub:* https://github.com/devwhitewizard/nexus-v1md\n\n` +
                     `👤 *Developer:* White Wizard\n` +
                     `🌐 *Portfolio:* https://jonathanmwanza.vercel.app/\n\n` +
                     `_Don't forget to give a ⭐ if you like the project!_`;

        await sock.sendMessage(jid, { 
            image: fs.readFileSync(path.join(__dirname, "../assets/Nexuspic.png")),
            caption: text
        }, { quoted: msg });
    }
};
