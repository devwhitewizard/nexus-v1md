const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "autodelete",
    description: "Toggles automatic deletion of bot messages.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const settings = getSettings();
        const action = args[0]?.toLowerCase();

        if (action === "on") settings.autoDelete = true;
        else if (action === "off") settings.autoDelete = false;
        else return await sock.sendMessage(jid, { text: "❓ *Usage:* `.autodelete on` or `.autodelete off`" });

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Auto-Delete* is now ${settings.autoDelete ? "ON" : "OFF"}` });
    }
};
