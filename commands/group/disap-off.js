module.exports = {
    name: "disap-off",
    aliases: ["disapoff"],
    description: "Turn off disappearing messages in this group",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            await sock.sendMessage(jid, { disappearingMessagesInChat: false });
            await sock.sendMessage(jid, { text: "📴 *Disappearing Messages:* Disabled for this chat." }, { quoted: msg });
        } catch (err) {
            console.error("Disap-off error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to disable disappearing messages. Ensure the bot is admin." }, { quoted: msg });
        }
    }
};
