module.exports = {
    name: "delete",
    aliases: ["del"],
    description: "Delete the replied message.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const key = {
            remoteJid: jid,
            fromMe: msg.message?.extendedTextMessage?.contextInfo?.participant === sock.user.id.split(":")[0] + "@s.whatsapp.net",
            id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
            participant: msg.message?.extendedTextMessage?.contextInfo?.participant
        };

        if (!key.id) return await sock.sendMessage(jid, { text: "❓ *Usage:* Reply to a message with `.delete` to remove it." });

        try {
            await sock.sendMessage(jid, { delete: key });
        } catch (err) {
            console.error("Delete command error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to delete message. Ensure I am admin." });
        }
    }
};
