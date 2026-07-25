const { MessageLog } = require("../../lib/messageModel");
const { Sequelize, Op } = require("sequelize");

module.exports = {
    name: "inactive",
    description: "Lists members who haven't sent a message recently.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants.map(p => p.id);

            const activeLast3Days = await MessageLog.findAll({
                where: {
                    remoteJid: jid,
                    createdAt: { [Op.gt]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
                },
                attributes: ['participant'],
                group: ['participant']
            });

            const activeList = activeLast3Days.map(a => a.participant);
            const inactive = participants.filter(p => !activeList.includes(p));

            if (inactive.length === 0) {
                return await sock.sendMessage(jid, { text: "✅ *Group Health:* Everyone has been active lately!" });
            }

            let report = `💤 *INACTIVE MEMBERS (3+ Days)* 💤\n\n`;
            report += `Total: \`${inactive.length}\` users\n\n`;
            inactive.slice(0, 30).forEach((user, i) => {
                report += `• @${user.split("@")[0]}\n`;
            });

            if (inactive.length > 30) report += `\n_...and ${inactive.length - 30} more._`;

            await sock.sendMessage(jid, { 
                text: report, 
                mentions: inactive.slice(0, 30) 
            }, { quoted: msg });

        } catch (err) {
            console.error("Inactive error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch inactive members." });
        }
    }
};
