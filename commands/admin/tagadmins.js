module.exports = {
    name: "tagadmins",
    aliases: ["adminsonly", "pingadmins"],
    description: "Mentions all admins in the group.",
    category: "admin",
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const metadata = await sock.groupMetadata(jid);
            const admins = metadata.participants.filter(p => p.admin || p.isSuperAdmin).map(p => p.id);
            
            if (admins.length === 0) return;

            const text = `🔔 *ADMIN ATTENTION REQUIRED* 🔔\n\n` +
                         admins.map(a => `@${a.split("@")[0]}`).join(" ");

            await sock.sendMessage(jid, { text, mentions: admins }, { quoted: msg });
        } catch (err) {
            console.error("TagAdmins error:", err);
        }
    }
};
