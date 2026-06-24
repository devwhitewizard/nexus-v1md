module.exports = {
    name: "togroupstatus",
    aliases: ["togglestatus", "toggroup"],
    description: "Toggle the group chat between open (members can talk) and closed (only admins can talk)",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        try {
            await sock.sendMessage(jid, { text: "⏳ Fetching group configurations..." }, { quoted: msg });
            const metadata = await sock.groupMetadata(jid);
            const isAnnounce = !!metadata.announce; // true = closed (announcement mode)

            if (isAnnounce) {
                // Open the group
                await sock.groupSettingUpdate(jid, "not_announcement");
                await sock.sendMessage(jid, { text: "🔓 *Group Opened:* All members can now send messages." }, { quoted: msg });
            } else {
                // Close the group
                await sock.groupSettingUpdate(jid, "announcement");
                await sock.sendMessage(jid, { text: "🔒 *Group Closed:* Only admins can now send messages." }, { quoted: msg });
            }
        } catch (error) {
            console.error("❌ Togroupstatus Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to toggle group status. Ensure the bot is admin." }, { quoted: msg });
        }
    }
};
