const { isOwner } = require("../lib/middleware");

module.exports = {
    name: "kickall",
    description: "Remove all non-admin members from the group",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            await sock.sendMessage(jid, { text: "⏳ Fetching group details..." }, { quoted: msg });
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants;
            
            const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            const admins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id);
            
            const targetJids = participants
                .map(p => p.id)
                .filter(id => id !== botJid && !isOwner(id) && !admins.includes(id));

            if (targetJids.length === 0) {
                return await sock.sendMessage(jid, { text: "⚠️ There are no members to remove (everyone is an admin or owner)." }, { quoted: msg });
            }

            await sock.sendMessage(jid, { text: `⏳ Removing *${targetJids.length}* members from the group...` }, { quoted: msg });
            
            // Chunk participant removals in batches of 10 to avoid server rate limit bans/lags
            const batchSize = 10;
            for (let i = 0; i < targetJids.length; i += batchSize) {
                const batch = targetJids.slice(i, i + batchSize);
                await sock.groupParticipantsUpdate(jid, batch, "remove");
                // Brief pause to stay safe
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            await sock.sendMessage(jid, { text: `✅ Successfully removed *${targetJids.length}* members.` }, { quoted: msg });
        } catch (error) {
            console.error("❌ Kickall Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to remove members. Ensure the bot is an admin." }, { quoted: msg });
        }
    }
};
