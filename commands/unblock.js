module.exports = {
    name: "unblock",
    description: "Unblock a user on WhatsApp",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg, isGroup } = ctx;
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       msg.message?.extendedTextMessage?.contextInfo?.participant || 
                       (args[0] && args[0].includes("@") ? args[0] : (args[0] ? `${args[0].replace(/[^0-9]/g, "")}@s.whatsapp.net` : null)) || 
                       (!isGroup ? jid : null);

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Please tag, reply to, or provide the phone number of the user to unblock." });
        }

        try {
            await sock.updateBlockStatus(target, "unblock");
            await sock.sendMessage(jid, { 
                text: `✅ Successfully unblocked @${target.split("@")[0]}`, 
                mentions: [target] 
            }, { quoted: msg });
        } catch (error) {
            console.error("❌ Unblock Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ Failed to unblock the user." }, { quoted: msg });
        }
    }
};
