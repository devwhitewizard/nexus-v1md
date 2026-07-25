module.exports = {
    name: "ban",
    description: "Blocks a user from the group (Permanent Kick).",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] && args[0].includes("@") ? args[0] : null);
        
        if (!user) return await sock.sendMessage(jid, { text: "❓ *Usage:* Mention a user to ban." });

        try {
            await sock.groupParticipantsUpdate(jid, [user], "remove");
            await sock.sendMessage(jid, { text: `🚫 *Banned:* @${user.split("@")[0]} has been removed from the group.`, mentions: [user] });
        } catch (err) {
            console.error("Ban error:", err);
        }
    }
};
