const fs = require("fs");
const path = require("path");

module.exports = {
    name: "rugut",
    aliases: ["imperator", "coalition"],
    description: "Bio of Imperator Rugut - Nexus Coalition Leader.",
    category: "general",
    async execute({ sock, jid, msg }) {
        try {
            const bio = 
                `👑 *IMPERATOR RUGUT* 👑\n` +
                `━━━━━━━━━━━━━━━━━━━\n\n` +
                `"I don’t settle for average, I don’t wait for permission, and I don’t compete with others — we raise each other. Built on discipline, vision, and action, the Coalition exists to push limits, turn ideas into impact, and prove that greatness isn’t a solo act.\n\n` +
                `It’s a mindset, a standard, and a responsibility. When we come together, colliding with White Wizard in tech, I don’t just chase success — I define it, we build it, and we leave the world better than we found it. Ordinary is not in our vocabulary."\n\n` +
                `⚔️ *Surviving is equal to winning and it always conquers.*\n\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `🔱 *NEXUS-1MD ELITE COALITION*`;

            const imagePath = path.join(__dirname, "../../assets/rugut.jpeg");

            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(jid, { 
                    image: fs.readFileSync(imagePath), 
                    caption: bio 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: bio }, { quoted: msg });
            }

        } catch (error) {
            console.error("Rugut Command Error:", error);
            await sock.sendMessage(jid, { text: "❌ Error displaying Imperator's bio." });
        }
    }
};
