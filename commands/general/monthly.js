const { getUser } = require("../../lib/userModel");

module.exports = {
    name: "monthly",
    description: "Claim your monthly bonus coins.",
    category: "general",
    async execute({ sock, jid, msg, sender }) {
        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            const now = Date.now();
            const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 days

            if (user.lastMonthly && (now - new Date(user.lastMonthly).getTime() < cooldown)) {
                const remaining = cooldown - (now - new Date(user.lastMonthly).getTime());
                const days = Math.floor(remaining / (24 * 3600000));
                return await sock.sendMessage(jid, { text: `💎 *Mega Reward Cooldown:* Already claimed this month.\n\nDays left: \`${days} days\`` }, { quoted: msg });
            }

            user.coins += 2000;
            user.lastMonthly = new Date(now);
            await user.save();

            await sock.sendMessage(jid, { 
                text: `👑 *MONTHLY REWARD* 👑\n\nYou've received: \`2000\` coins!\nYour new balance: \`${user.coins}\` coins\n\n_Thank you for being a loyal member!_` 
            }, { quoted: msg });
        } catch (err) {
            console.error("Monthly error:", err);
        }
    }
};
