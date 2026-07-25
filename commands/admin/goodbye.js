const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "goodbye",
    description: "Toggles auto-goodbye messages.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const settings = getSettings();
        const action = args[0]?.toLowerCase();

        if (action === "on") settings.goodbye = true;
        else if (action === "off") settings.goodbye = false;
        else return await sock.sendMessage(jid, { text: "❓ *Usage:* `.goodbye on` or `.goodbye off`" });

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Auto-Goodbye* is now ${settings.goodbye ? "ON" : "OFF"}` });
    }
};
