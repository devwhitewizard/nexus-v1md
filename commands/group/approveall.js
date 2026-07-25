module.exports = {
    name: "approveall",
    aliases: ["approve"],
    description: "Approve all pending group participant join requests",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            await sock.sendMessage(jid, { text: "⏳ Fetching pending requests..." }, { quoted: msg });
            const requests = await sock.groupRequestParticipantsList(jid);

            if (!requests || requests.length === 0) {
                return await sock.sendMessage(jid, { text: "⚠️ There are no pending join requests in this group." }, { quoted: msg });
            }

            const userJids = requests.map(r => r.jid);
            await sock.sendMessage(jid, { text: `⏳ Approving *${userJids.length}* pending requests...` }, { quoted: msg });
            
            await sock.groupRequestParticipantsUpdate(jid, userJids, "approve");
            await sock.sendMessage(jid, { text: `✅ Successfully approved *${userJids.length}* pending join requests.` }, { quoted: msg });
        } catch (error) {
            console.error("❌ Approveall Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to approve requests. Ensure the bot is admin and Membership Approval is enabled." }, { quoted: msg });
        }
    }
};
