const { getUser } = require("../../nexus/userModel");

module.exports = {
    name: "daily",
    description: "Claim your daily bonus coins.",
    category: "general",
    async execute({ sock, jid, msg, sender }) {
        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000; // 24 hours

            if (user.lastDaily && (now - new Date(user.lastDaily).getTime() < cooldown)) {
                const remaining = cooldown - (now - new Date(user.lastDaily).getTime());
                const hours = Math.floor(remaining / 3600000);
                const minutes = Math.floor((remaining % 3600000) / 60000);
                return await sock.sendMessage(jid, { text: `⏳ *Slow Down!* You've already claimed your daily reward.\n\nTry again in: \`${hours}h ${minutes}m\`` }, { quoted: msg });
            }

            user.coins += 100;
            user.lastDaily = new Date(now);
            await user.save();

            await sock.sendMessage(jid, { 
                text: `🎁 *DAILY REWARD* 🎁\n\nYou've received: \`100\` coins!\nYour new balance: \`${user.coins}\` coins` 
            }, { quoted: msg });
        } catch (err) {
            console.error("Daily error:", err);
        }
    }
};
