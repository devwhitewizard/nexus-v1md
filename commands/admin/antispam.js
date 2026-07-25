const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "antispam",
    description: "Toggles anti-spam detection.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const settings = getSettings();
        const action = args[0]?.toLowerCase();

        if (action === "on") settings.antiSpam = true;
        else if (action === "off") settings.antiSpam = false;
        else return await sock.sendMessage(jid, { text: "❓ *Usage:* `.antispam on` or `.antispam off`" });

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Anti-Spam* is now ${settings.antiSpam ? "ON" : "OFF"}` });
    }
};
