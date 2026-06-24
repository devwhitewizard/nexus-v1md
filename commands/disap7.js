module.exports = {
    name: "disap7",
    description: "Set disappearing messages in this group to 7 days",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            // 7 days = 604800 seconds
            await sock.sendMessage(jid, { disappearingMessagesInChat: 604800 });
            await sock.sendMessage(jid, { text: "⏳ *Disappearing Messages:* Set to *7 days*." }, { quoted: msg });
        } catch (err) {
            console.error("Disap7 error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to set disappearing messages. Ensure the bot is admin." }, { quoted: msg });
        }
    }
};
