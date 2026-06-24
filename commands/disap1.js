module.exports = {
    name: "disap1",
    description: "Set disappearing messages in this group to 24 hours (1 day)",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            // 24 hours = 86400 seconds
            await sock.sendMessage(jid, { disappearingMessagesInChat: 86400 });
            await sock.sendMessage(jid, { text: "⏳ *Disappearing Messages:* Set to *24 hours* (1 day)." }, { quoted: msg });
        } catch (err) {
            console.error("Disap1 error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to set disappearing messages. Ensure the bot is admin." }, { quoted: msg });
        }
    }
};
