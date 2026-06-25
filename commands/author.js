const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "author",
    aliases: ["setauthor", "stickerauthor"],
    description: "Change the sticker author name of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const authorName = args.join(" ").trim();

        if (!authorName) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.author <author_name>`" }, { quoted: msg });
        }

        try {
            await updateSettings({ author: authorName });
            await sock.sendMessage(jid, { text: `✅ *Sticker Author Updated:* Now set to *${authorName}*.` }, { quoted: msg });
        } catch (err) {
            console.error("Author name change error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update author name: ${err.message}` }, { quoted: msg });
        }
    }
};
