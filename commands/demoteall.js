const { isOwner } = require("../lib/middleware");

module.exports = {
    name: "demoteall",
    description: "Demote all group admins (except the bot and owner)",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            await sock.sendMessage(jid, { text: "⏳ Fetching group administrators..." }, { quoted: msg });
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants;
            
            const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            const targetJids = participants
                .filter(p => (p.admin === "admin" || p.admin === "superadmin") && p.id !== botJid && !isOwner(p.id))
                .map(p => p.id);

            if (targetJids.length === 0) {
                return await sock.sendMessage(jid, { text: "⚠️ There are no other admins to demote." }, { quoted: msg });
            }

            await sock.sendMessage(jid, { text: `⏳ Demoting *${targetJids.length}* admins...` }, { quoted: msg });
            await sock.groupParticipantsUpdate(jid, targetJids, "demote");
            await sock.sendMessage(jid, { text: `✅ Successfully demoted *${targetJids.length}* admins.` }, { quoted: msg });
        } catch (error) {
            console.error("❌ Demoteall Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to demote admins. Ensure the bot has administrative privileges." }, { quoted: msg });
        }
    }
};
