const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "timezone",
    aliases: ["settimezone", "tz"],
    description: "Change the timezone of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const zone = args[0]?.trim();

        if (!zone) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Usage: `.timezone <zone>`\n\n*Example:*\n▸ `.timezone Africa/Nairobi`\n▸ `.timezone America/New_York`" 
            }, { quoted: msg });
        }

        try {
            await updateSettings({ timezone: zone });
            process.env.TZ = zone;
            await sock.sendMessage(jid, { text: `✅ *Timezone Updated:* Now set to *${zone}*.\n\n_System time formatting will now align with this zone._` }, { quoted: msg });
        } catch (err) {
            console.error("Timezone change error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update timezone: ${err.message}` }, { quoted: msg });
        }
    }
};
