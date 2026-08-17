module.exports = {
    name: "demote",
    aliases: ["unadmin"],
    description: "Demote an admin to a regular member",
    category: "admin",
    isAdminOnly: true,
    isGroupOnly: true,
    isBotAdmin: true,
    execute: async (ctx) => {
        const { sock, jid, msg, args } = ctx;

        // 1. Resolve Target JID from mentions, quoted message, or phone number argument
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
                text: "⚠️ *Usage:* Reply to an admin's message, tag them (`.demote @user`), or enter their number (`.demote 2547...`)." 
            }, { quoted: msg });
        }

        try {
            // Always re-fetch fresh metadata to avoid stale cache
            const metadata = await sock.groupMetadata(jid).catch(() => null);
            if (!metadata || !metadata.participants) {
                return await sock.sendMessage(jid, { text: "❌ Could not fetch group information. Try again." }, { quoted: msg });
            }

            // Resolve target participant and valid Phone JID
            const resolved = resolveGroupParticipant(rawTarget, metadata);

            if (!resolved) {
                const displayNum = rawTarget.split("@")[0].split(":")[0].replace(/\D/g, "") || "User";
                return await sock.sendMessage(jid, { 
                    text: `⚠️ *@${displayNum}* is not a member of this group.`, 
                    mentions: [rawTarget] 
                }, { quoted: msg });
            }

            const { participant, phoneJid, displayNum } = resolved;

            if (!participant.admin) {
                return await sock.sendMessage(jid, { 
                    text: `ℹ️ *@${displayNum}* is not a Group Admin.`, 
                    mentions: [phoneJid] 
                }, { quoted: msg });
            }

            // Execute demotion with valid Phone JID
            await sock.groupParticipantsUpdate(jid, [phoneJid], "demote");

            await sock.sendMessage(jid, { 
                text: `⚠️ *@${displayNum}* is no longer a Group Admin.`, 
                mentions: [phoneJid] 
            }, { quoted: msg });
        } catch (error) {
            console.error("❌ Demote Error:", error);
            await sock.sendMessage(jid, { 
                text: `❌ *Failed to demote user:* \`${error.message || "Unknown error"}\`\n\n_Ensure the bot is a Group Admin._` 
            }, { quoted: msg });
        }
    }
};

function resolveGroupParticipant(rawTarget, metadata) {
    if (!metadata || !metadata.participants) return null;

    const rawTargetClean = rawTarget.split(":")[0].toLowerCase();
    const targetDigits = rawTargetClean.replace(/\D/g, "");

    // 1. Direct match by exact id or lid property
    let participant = metadata.participants.find(p => {
        const pIdClean = p.id.split(":")[0].toLowerCase();
        const pLidClean = (p.lid || "").split(":")[0].toLowerCase();
        return pIdClean === rawTargetClean || (pLidClean && pLidClean === rawTargetClean);
    });

    // 2. Match by phone digits if direct match failed
    if (!participant && targetDigits) {
        participant = metadata.participants.find(p => {
            const pIdDigits = p.id.split("@")[0].split(":")[0].replace(/\D/g, "");
            const pLidDigits = (p.lid || "").split("@")[0].split(":")[0].replace(/\D/g, "");
            return (pIdDigits && (pIdDigits === targetDigits || pIdDigits.endsWith(targetDigits) || targetDigits.endsWith(pIdDigits))) ||
                   (pLidDigits && (pLidDigits === targetDigits || pLidDigits.endsWith(targetDigits) || targetDigits.endsWith(pLidDigits)));
        });
    }

    if (!participant) return null;

    // Determine the Phone JID for WhatsApp groupParticipantsUpdate (@s.whatsapp.net)
    let phoneJid = participant.id;
    if (phoneJid.endsWith("@lid")) {
        const phoneDigits = (participant.phoneNumber || participant.id).replace(/\D/g, "");
        if (phoneDigits) {
            phoneJid = `${phoneDigits}@s.whatsapp.net`;
        }
    } else {
        const cleanPhoneNum = phoneJid.split("@")[0].split(":")[0].replace(/\D/g, "");
        if (cleanPhoneNum) {
            phoneJid = `${cleanPhoneNum}@s.whatsapp.net`;
        }
    }

    return {
        participant,
        phoneJid,
        displayNum: phoneJid.split("@")[0]
    };
}
