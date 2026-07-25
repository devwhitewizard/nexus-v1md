const { MessageLog } = require("../../nexus/messageModel");
const { Op } = require("sequelize");

module.exports = {
    name: "detectspam",
    aliases: ["spamcheck"],
    description: "Analyze recent messages to detect spamming behavior.",
    category: "admin",
    adminOnly: true,
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "🔍 *Analyzing recent activity patterns...*" });

            // Fetch last 100 messages in this chat
            const logs = await MessageLog.findAll({
                where: { remoteJid: jid },
                order: [["timestamp", "DESC"]],
                limit: 100
            });

            if (logs.length < 5) {
                return await sock.sendMessage(jid, { text: "✅ Not enough data to analyze yet." });
            }

            // Count messages per user in the last 1 minute
            const now = Math.floor(Date.now() / 1000);
            const userCounts = {};
            
            logs.forEach(log => {
                if (now - log.timestamp < 60) {
                    userCounts[log.participant] = (userCounts[log.participant] || 0) + 1;
                }
            });

            let report = `🛡️ *SPAM DETECTION REPORT*\n\n`;
            let foundSpam = false;

            for (const [user, count] of Object.entries(userCounts)) {
                if (count > 5) {
                    foundSpam = true;
                    report += `⚠️ @${user.split("@")[0]}: *${count} msgs/min* (HIGH)\n`;
                }
            }

            if (!foundSpam) {
                report += `✅ *System Status:* Clear. No active spammers detected in the last minute.`;
            } else {
                report += `\n🚩 _Admins are advised to monitor or warn these users._`;
            }

            await sock.sendMessage(jid, { text: report, mentions: Object.keys(userCounts) });

        } catch (error) {
            console.error("DetectSpam error:", error);
            await sock.sendMessage(jid, { text: "❌ Error during spam analysis." });
        }
    }
};
