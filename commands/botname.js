const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "botname",
    aliases: ["setbotname"],
    description: "Change the name of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const name = args.join(" ").trim();

        if (!name) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.botname <new_name>`" }, { quoted: msg });
        }

        try {
            await updateSettings({ botName: name });
            await sock.sendMessage(jid, { text: `✅ *Bot Name Changed:* The bot is now named *${name}*.` }, { quoted: msg });
        } catch (err) {
            console.error("Botname change error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update bot name: ${err.message}` }, { quoted: msg });
        }
    }
};
