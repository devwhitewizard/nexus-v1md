module.exports = {
    name: "invite",
    aliases: ["link", "getlink"],
    description: "Get the group invite link.",
    category: "group",
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const code = await sock.groupInviteCode(jid);
            const inviteLink = `https://chat.whatsapp.com/${code}`;
            
            await sock.sendMessage(jid, { 
                text: `🔗 *GROUP INVITE LINK*\n\n${inviteLink}\n\n_Share this link to invite others to the group!_`,
                contextInfo: {
                    externalAdReply: {
                        title: "Nexus-1MD Group Invite",
                        body: "Join our community!",
                        thumbnailUrl: "https://files.catbox.moe/p9pntu.jpg",
                        sourceUrl: inviteLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: msg });
        } catch (err) {
            console.error("Invite code error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch invite link. Ensure I am an admin." });
        }
    }
};
