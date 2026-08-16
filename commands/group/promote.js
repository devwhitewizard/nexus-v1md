module.exports = {
    name: "promote",
    aliases: ["pm", "makeadmin"],
    description: "Promote a member to group admin",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    isBotAdmin: true,
    execute: async (ctx) => {
        const { sock, jid, msg, args } = ctx;

        // 1. Resolve Target JID dynamically (Mentions, Quoted Message, or Phone Number Argument)
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo ||
                            msg.message?.documentMessage?.contextInfo;

        let rawTarget = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

        if (!rawTarget && args && args[0]) {
            let argStr = args[0].trim();
            if (argStr.startsWith("@")) argStr = argStr.slice(1);
            const digits = argStr.replace(/\D/g, "");
            if (digits) {
                let cleanDigits = digits;
                if (cleanDigits.startsWith("0")) cleanDigits = "254" + cleanDigits.slice(1);
                rawTarget = `${cleanDigits}@s.whatsapp.net`;
            }
        }

        if (!rawTarget) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:* Reply to a user's message, tag them (`.promote @user`), or enter their number (`.promote 2547...`)." 
            }, { quoted: msg });
        }

        // Clean target JID (strip device suffix like :12 if present)
        const cleanNum = rawTarget.split("@")[0].split(":")[0].replace(/\D/g, "");
        if (!cleanNum) {
            return await sock.sendMessage(jid, { text: "⚠️ Invalid user number provided." }, { quoted: msg });
        }
        const targetJid = `${cleanNum}@s.whatsapp.net`;

        try {
            // Fetch group metadata to validate membership and current admin status
            const metadata = await sock.groupMetadata(jid).catch(() => null);
            if (metadata && metadata.participants) {
                const participant = metadata.participants.find(p => p.id.split(":")[0].split("@")[0] === cleanNum);
                
                if (!participant) {
                    return await sock.sendMessage(jid, { 
                        text: `⚠️ *@${cleanNum}* is not a member of this group.`, 
                        mentions: [targetJid] 
                    }, { quoted: msg });
                }

                if (participant.admin === "admin" || participant.admin === "superadmin") {
                    return await sock.sendMessage(jid, { 
                        text: `ℹ️ *@${cleanNum}* is already a Group Admin!`, 
                        mentions: [targetJid] 
                    }, { quoted: msg });
                }
            }

            await sock.groupParticipantsUpdate(jid, [targetJid], "promote");
            await sock.sendMessage(jid, { 
                text: `🎉 *@${cleanNum}* has been successfully promoted to Group Admin! 👑`, 
                mentions: [targetJid] 
            }, { quoted: msg });
        } catch (error) {
            console.error("❌ Promote Error:", error);
            await sock.sendMessage(jid, { 
                text: `❌ *Failed to promote user:* \`${error.message || "Unknown error"}\`\n\n_Ensure the bot is a Group Admin._` 
            }, { quoted: msg });
        }
    }
};
