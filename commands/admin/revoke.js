module.exports = {
    name: "revoke",
    description: "Resets the group invite link.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid }) {
        try {
            await sock.groupRevokeInvite(jid);
            const newCode = await sock.groupInviteCode(jid);
            const newLink = `https://chat.whatsapp.com/${newCode}`;
            await sock.sendMessage(jid, { text: `♻️ *Invite Link Revoked!*\n\nA new link has been generated:\n${newLink}` });
        } catch (err) {
            console.error("Revoke error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to revoke link. Ensure the bot is an admin." });
        }
    }
};
