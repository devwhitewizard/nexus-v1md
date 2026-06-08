const fs = require("fs");
const path = require("path");

module.exports = {
    name: "jeff",
    aliases: ["skylar"],
    description: "Bio of Skylar Jeff - Nexus member.",
    category: "general",
    async execute({ sock, jid, msg }) {
        try {
            const bio = 
                `👨‍💻 *SKYLAR JEFF* 👨‍💻\n` +
                `━━━━━━━━━━━━━━━━━━━\n\n` +
                `*Bio:* A young technophile yearning to be more knowledgeable in the tech world. Explore the tech world and have a ball.\n\n` +
                `*Quote:*\n` +
                `_"This is the whole point of technology. It creates an appetite for immortality on the one hand. It threatens universal extinction on the other. Technology is lust removed from nature."_\n\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `🔱 *NEXUS-1MD MEMBER*`;

            const imagePath = path.join(__dirname, "../assets/skylar.jpeg");

            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(jid, { 
                    image: fs.readFileSync(imagePath), 
                    caption: bio 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: bio }, { quoted: msg });
            }

        } catch (error) {
            console.error("Jeff Command Error:", error);
            await sock.sendMessage(jid, { text: "❌ Error displaying Skylar Jeff's bio." });
        }
    }
};
