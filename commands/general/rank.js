const { User } = require("../../nexus/userModel");

module.exports = {
    name: "rank",
    aliases: ["leaderboard", "lb", "level"],
    description: "Show top users by XP.",
    category: "general",
    async execute({ sock, jid, msg, sender }) {
        try {
            const topUsers = await User.findAll({
                order: [['xp', 'DESC']],
                limit: 10
            });

            let rankText = `🏆 *NEXUS GLOBAL RANKINGS*\n\n`;
            topUsers.forEach((user, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤";
                rankText += `${medal} *#${i + 1}:* @${user.id.split("@")[0]} - Lvl ${user.level}\n`;
            });

            // Find user's own rank
            const allUsers = await User.findAll({ order: [['xp', 'DESC']] });
            const myRank = allUsers.findIndex(u => u.id === sender) + 1;

            rankText += `\n━━━━━━━━━━━━━\n👤 *Your Rank:* #${myRank}\n_Keep it up!_`;

            await sock.sendMessage(jid, { 
                text: rankText, 
                mentions: topUsers.map(u => u.id) 
            }, { quoted: msg });
        } catch (err) {
            console.error("Rank error:", err);
        }
    }
};
