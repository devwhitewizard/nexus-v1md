const { MessageLog } = require("../../nexus/messageModel");
const { Sequelize } = require("sequelize");

module.exports = {
    name: "activity",
    description: "Show a ranking of the most active members in the group.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const stats = await MessageLog.findAll({
                where: { remoteJid: jid },
                attributes: [
                    'participant',
                    [Sequelize.fn('COUNT', Sequelize.col('msgId')), 'msgCount']
                ],
                group: ['participant'],
                order: [[Sequelize.literal('msgCount'), 'DESC']],
                limit: 10
            });

            if (stats.length === 0) {
                return await sock.sendMessage(jid, { text: "📈 *Activity Report:* No message data found yet." });
            }

            let report = `📈 *MOST ACTIVE MEMBERS* 📈\n\n`;
            stats.forEach((stat, i) => {
                const count = stat.get('msgCount');
                const user = stat.participant;
                report += `${i + 1}. @${user.split("@")[0]} - \`${count}\` messages\n`;
            });

            await sock.sendMessage(jid, { 
                text: report, 
                mentions: stats.map(s => s.participant) 
            }, { quoted: msg });

        } catch (err) {
            console.error("Activity error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to generate activity report." });
        }
    }
};
