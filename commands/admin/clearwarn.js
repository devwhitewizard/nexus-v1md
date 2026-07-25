const { clearWarnings } = require("../../database/warnings");

module.exports = {
    name: "clearwarn",
    description: "Resets user warnings to zero.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] && args[0].includes("@") ? args[0] : null);
        
        if (!user) return await sock.sendMessage(jid, { text: "❓ *Usage:* Mention a user to clear warnings." });

        try {
            await clearWarnings(user, jid);
            await sock.sendMessage(jid, { 
                text: `✅ *Warnings Cleared:* @${user.split("@")[0]} has had their warnings reset.`, 
                mentions: [user] 
            }, { quoted: msg });
        } catch (err) {
            console.error("ClearWarn error:", err);
        }
    }
};
