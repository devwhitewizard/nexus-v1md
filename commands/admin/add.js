module.exports = {
    name: "add",
    description: "Adds a user by phone number.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const phone = args[0]?.replace(/[^0-9]/g, "");
        if (!phone) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.add 2547xxxxxxxx`" });

        const userJid = phone + "@s.whatsapp.net";

        try {
            const response = await sock.groupParticipantsUpdate(jid, [userJid], "add");
            
            // Check if the add was blocked by privacy settings (status 403)
            if (response[0]?.status === "403") {
                const code = await sock.groupInviteCode(jid);
                const inviteLink = `https://chat.whatsapp.com/${code}`;
                return await sock.sendMessage(jid, { 
                    text: `⚠️ *Privacy Settings:* I couldn't add @${phone} directly because of their privacy settings.\n\n🔗 *Invite Link:* ${inviteLink}\n_Please share this link with them._`, 
                    mentions: [userJid] 
                });
            }

            await sock.sendMessage(jid, { text: `✅ *User Added:* @${phone} has been added to the group.`, mentions: [userJid] });
        } catch (err) {
            console.error("Add error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to add user. Ensure the bot is an admin and the number is correct." });
        }
    }
};
