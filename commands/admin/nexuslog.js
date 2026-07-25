const { MessageLog } = require("../../nexus/messageModel");

module.exports = {
    name: "log",
    aliases: ["nexuslog", "history"],
    description: "Display recent bot activity from the database.",
    category: "admin",
    adminOnly: true,
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "📜 *Retrieving recent nexus logs...*" });

            // Fetch last 20 actions globally
            const logs = await MessageLog.findAll({
                order: [["timestamp", "DESC"]],
                limit: 20
            });

            if (logs.length === 0) {
                return await sock.sendMessage(jid, { text: "📭 No logs found." });
            }

            let logText = `📜 *NEXUS ACTIVITY LOGS*\n\n`;
            
            logs.forEach((log, index) => {
                const date = new Date(log.timestamp * 1000).toLocaleTimeString("en-GB", { hour12: false });
                logText += `${index + 1}. [${date}] *${log.pushName || "System"}*\n`;
                logText += `   📍 JID: ${log.remoteJid.split("@")[0]}\n`;
                logText += `   📟 TYPE: ${log.messageType}\n\n`;
            });

            logText += `_Showing last 20 events._`;

            await sock.sendMessage(jid, { text: logText }, { quoted: msg });

        } catch (error) {
            console.error("NexusLog error:", error);
            await sock.sendMessage(jid, { text: "❌ Error retrieving logs." });
        }
    }
};
