module.exports = {
    name: "link",
    aliases: ["grouplink", "glink"],
    description: "Get the group invite link.",
    category: "group",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid }) {
        try {
            const code = await sock.groupInviteCode(jid);
            const link = `https://chat.whatsapp.com/${code}`;
            await sock.sendMessage(jid, { text: `🔗 *Group Invite Link:*\n\n${link}` });
        } catch (err) {
            console.error("Link fetch error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch invite link. Ensure the bot is an admin." });
        }
    }
};
