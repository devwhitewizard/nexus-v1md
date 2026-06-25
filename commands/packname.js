const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "packname",
    aliases: ["setpackname"],
    description: "Change the sticker pack name of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const name = args.join(" ").trim();

        if (!name) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.packname <pack_name>`" }, { quoted: msg });
        }

        try {
            await updateSettings({ packName: name });
            await sock.sendMessage(jid, { text: `✅ *Sticker Pack Name Updated:* Now set to *${name}*.` }, { quoted: msg });
        } catch (err) {
            console.error("Packname change error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update pack name: ${err.message}` }, { quoted: msg });
        }
    }
};
