const { getUser } = require("../../lib/userModel");

module.exports = {
    name: "weekly",
    description: "Claim your weekly bonus coins.",
    category: "general",
    async execute({ sock, jid, msg, sender }) {
        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            const now = Date.now();
            const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

            if (user.lastWeekly && (now - new Date(user.lastWeekly).getTime() < cooldown)) {
                const remaining = cooldown - (now - new Date(user.lastWeekly).getTime());
                const days = Math.floor(remaining / (24 * 3600000));
                const hours = Math.floor((remaining % (24 * 3600000)) / 3600000);
                return await sock.sendMessage(jid, { text: `📅 *Cooldown Active:* Already claimed this week.\n\nTime left: \`${days}d ${hours}h\`` }, { quoted: msg });
            }

            user.coins += 500;
            user.lastWeekly = new Date(now);
            await user.save();

            await sock.sendMessage(jid, { 
                text: `🎖️ *WEEKLY REWARD* 🎖️\n\nYou've received: \`500\` coins!\nYour new balance: \`${user.coins}\` coins` 
            }, { quoted: msg });
        } catch (err) {
            console.error("Weekly error:", err);
        }
    }
};
