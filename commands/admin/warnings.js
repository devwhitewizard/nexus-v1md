const { getWarnings } = require("../../database/warnings");

module.exports = {
    name: "warnings",
    description: "Check user warning count.",
    category: "admin",
    groupOnly: true,
    async execute({ sock, jid, args, msg, sender }) {
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender;
        
        try {
            const count = await getWarnings(user, jid);
            await sock.sendMessage(jid, { 
                text: `📊 *Warning Status:* @${user.split("@")[0]}\n*Current Warnings:* ${count}/3`, 
                mentions: [user] 
            }, { quoted: msg });
        } catch (err) {
            console.error("Warnings check error:", err);
        }
    }
};
