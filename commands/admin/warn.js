const { addWarning } = require("../../database/warnings");

module.exports = {
    name: "warn",
    description: "Issuing a warning to a user (3 warns = kick).",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] && args[0].includes("@") ? args[0] : null);
        
        if (!user) return await sock.sendMessage(jid, { text: "❓ *Usage:* Mention a user to warn." });

        try {
            const count = await addWarning(user, jid);
            
            if (count >= 3) {
                await sock.sendMessage(jid, { text: `🚫 *Warning Limit Reached:* @${user.split("@")[0]} has been warned 3 times and will be removed.`, mentions: [user] });
                await sock.groupParticipantsUpdate(jid, [user], "remove");
                const { clearWarnings } = require("../../database/warnings");
                await clearWarnings(user, jid);
            } else {
                await sock.sendMessage(jid, { 
                    text: `⚠️ *Warning Issued:* @${user.split("@")[0]}\n*Total Warnings:* ${count}/3\n_Be careful not to break the rules again!_`, 
                    mentions: [user] 
                }, { quoted: msg });
            }
        } catch (err) {
            console.error("Warn error:", err);
        }
    }
};
