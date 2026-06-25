const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "prefix",
    aliases: ["setprefix"],
    description: "Change the command prefix of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const newPrefix = args[0]?.trim();

        if (!newPrefix) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Usage: `.prefix <symbol>`\n\n*Examples:*\n▸ `.prefix !` (Sets prefix to !)\n▸ `.prefix .` (Sets prefix to .)\n▸ `.prefix #` (Sets prefix to #)" 
            }, { quoted: msg });
        }

        try {
            await updateSettings({ prefix: newPrefix });
            
            // Sync runtime environment and command handler config
            process.env.PREFIX = newPrefix;
            try {
                const config = require("../config");
                config.prefixes = [newPrefix];
            } catch (e) {
                console.error("Config prefix sync failed:", e);
            }

            await sock.sendMessage(jid, { 
                text: `✅ *Prefix Changed:* The bot prefix has been successfully updated to: \`${newPrefix}\`\n\n_All commands must now start with: \`${newPrefix}\`_` 
            }, { quoted: msg });
        } catch (err) {
            console.error("Prefix change error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update prefix: ${err.message}` }, { quoted: msg });
        }
    }
};
