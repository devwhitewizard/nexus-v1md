module.exports = {
    name: "kick",
    description: "Remove a member from the group",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    isBotAdmin: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Please tag or reply to the user you want to kick." });
        }

        try {
            await sock.groupParticipantsUpdate(jid, [target], "remove");
            await sock.sendMessage(jid, { text: `✅ User removed from the group.` });
        } catch (error) {
            console.error("❌ Kick Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to kick user. Make sure I'm a group admin." });
        }
    }
};
