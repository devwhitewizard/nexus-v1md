module.exports = {
    name: "disap90",
    description: "Set disappearing messages in this group to 90 days",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            // 90 days = 7776000 seconds
            await sock.sendMessage(jid, { disappearingMessagesInChat: 7776000 });
            await sock.sendMessage(jid, { text: "⏳ *Disappearing Messages:* Set to *90 days*." }, { quoted: msg });
        } catch (err) {
            console.error("Disap90 error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to set disappearing messages. Ensure the bot is admin." }, { quoted: msg });
        }
    }
};
