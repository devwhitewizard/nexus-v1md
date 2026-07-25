module.exports = {
    name: "mute",
    aliases: ["close", "lock"],
    description: "Locks the group so only admins can message.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid }) {
        try {
            await sock.groupSettingUpdate(jid, "announcement");
            await sock.sendMessage(jid, { text: "🔒 *Group Muted:* Only admins can now send messages." });
        } catch (err) {
            console.error("Mute error:", err);
        }
    }
};
