module.exports = {
    name: "promote",
    description: "Promote a member to admin",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    isBotAdmin: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Please tag or reply to the user you want to promote." });
        }

        try {
            await sock.groupParticipantsUpdate(jid, [target], "promote");
            await sock.sendMessage(jid, { text: `✅ User promoted to admin.` });
        } catch (error) {
            console.error("❌ Promote Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to promote user." });
        }
    }
};
