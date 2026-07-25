const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "mode",
    aliases: ["botmode", "public", "private"],
    description: "Switch between Public and Private mode",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args } = ctx;
        const settings = getSettings();
        const input = args[0]?.toLowerCase();

        let newMode = !settings.publicMode; // Default to toggle

        if (input === "public" || input === "on") {
            newMode = true;
        } else if (input === "private" || input === "off") {
            newMode = false;
        }

        settings.publicMode = newMode;
        await updateSettings(settings);

        const status = newMode ? "🔓 *PUBLIC*" : "🔒 *PRIVATE*";
        await sock.sendMessage(jid, { 
            text: `✅ *Bot Mode Updated*\n\nThe bot is now in ${status} mode.\n${newMode ? "_Everyone can now use commands._" : "_Only owners can use commands._"}` 
        });
    }
};
