const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "antibadword",
    description: "Toggles anti-badword filtering.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const settings = getSettings();
        const action = args[0]?.toLowerCase();

        if (action === "on") settings.antiBadword = true;
        else if (action === "off") settings.antiBadword = false;
        else return await sock.sendMessage(jid, { text: "❓ *Usage:* `.antibadword on` or `.antibadword off`" });

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Anti-Badword* is now ${settings.antiBadword ? "ON" : "OFF"}` });
    }
};
