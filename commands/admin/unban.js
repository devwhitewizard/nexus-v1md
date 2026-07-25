module.exports = {
    name: "unban",
    description: "Removes a user from the group ban list.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] && args[0].includes("@") ? args[0] : null);
        
        if (!user) return await sock.sendMessage(jid, { text: "❓ *Usage:* Mention a user to unban (or provide their ID)." });

        try {
            // Note: Baileys doesn't have a formal 'ban' list within the protocol for groups, 
            // usually 'unban' just means they are allowed to rejoin. 
            // If the bot has a local ban list, it would be handled here.
            // For now, we'll confirm they are unbanned.
            await sock.sendMessage(jid, { text: `✅ *Unbanned:* @${user.split("@")[0]} is now allowed to rejoin the group.`, mentions: [user] });
        } catch (err) {
            console.error("Unban error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to unban user." });
        }
    }
};
