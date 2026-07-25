module.exports = {
    name: "unmute",
    aliases: ["open", "unlock"],
    description: "Unlocks the group so everyone can message.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid }) {
        try {
            await sock.groupSettingUpdate(jid, "not_announcement");
            await sock.sendMessage(jid, { text: "🔓 *Group Unmuted:* Everyone can now send messages." });
        } catch (err) {
            console.error("Unmute error:", err);
        }
    }
};
