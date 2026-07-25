module.exports = {
    name: "admins",
    description: "Lists all group administrators.",
    category: "group",
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const metadata = await sock.groupMetadata(jid);
            const admins = metadata.participants.filter(p => p.admin || p.isSuperAdmin).map(p => p.id);
            
            let response = `🛡️ *GROUP ADMINISTRATORS*\n\n`;
            admins.forEach((admin, i) => {
                response += `${i + 1}. @${admin.split("@")[0]}\n`;
            });
            response += `\n_Total Admins: ${admins.length}_`;

            await sock.sendMessage(jid, { text: response, mentions: admins }, { quoted: msg });
        } catch (err) {
            console.error("Admins list error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch admins." });
        }
    }
};
