const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "welcome",
    description: "Toggles auto-welcome messages.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const settings = getSettings();
        const action = args[0]?.toLowerCase();

        if (action === "on") settings.welcome = true;
        else if (action === "off") settings.welcome = false;
        else return await sock.sendMessage(jid, { text: "❓ *Usage:* `.welcome on` or `.welcome off`" });

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Auto-Welcome* is now ${settings.welcome ? "ON" : "OFF"}` });
    }
};
