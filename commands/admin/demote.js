module.exports = {
    name: "demote",
    description: "Removes admin rights from a user.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] && args[0].includes("@") ? args[0] : null);
        
        if (!user) return await sock.sendMessage(jid, { text: "❓ *Usage:* Mention a user to demote." });

        try {
            await sock.groupParticipantsUpdate(jid, [user], "demote");
            await sock.sendMessage(jid, { text: `✅ *Demoted:* @${user.split("@")[0]} is no longer an admin.`, mentions: [user] });
        } catch (err) {
            console.error("Demote error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to demote user. Ensure the bot is an admin." });
        }
    }
};
