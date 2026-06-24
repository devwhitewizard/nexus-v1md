module.exports = {
    name: "getvar",
    description: "Get a specific variable value (sent via DM if in group)",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, sender, msg } = ctx;
        if (!args[0]) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.getvar <key>`" }, { quoted: msg });
        }

        const key = args[0].toUpperCase();
        const value = process.env[key];

        if (value === undefined) {
            return await sock.sendMessage(jid, { text: `⚠️ Variable *${key}* is not set.` }, { quoted: msg });
        }

        const isGroup = jid.endsWith("@g.us");
        const responseText = `🔑 *Variable Request*\n\n*${key}:* \`${value}\``;

        if (isGroup) {
            try {
                // Send to owner's DM
                await sock.sendMessage(sender, { text: responseText });
                // Notify in group that it was sent to DM
                await sock.sendMessage(jid, { text: `📩 Sent value of *${key}* to your private DM to prevent leakage.` }, { quoted: msg });
            } catch (e) {
                // Fallback to group if DM fails
                await sock.sendMessage(jid, { text: `${responseText}\n\n⚠️ _Failed to send via DM, showing here._` }, { quoted: msg });
            }
        } else {
            await sock.sendMessage(jid, { text: responseText }, { quoted: msg });
        }
    }
};
