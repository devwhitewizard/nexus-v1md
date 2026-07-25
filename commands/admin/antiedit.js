const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "antiedit",
    aliases: ["antied"],
    description: "Toggle Anti-Edit feature (detect when someone edits a message).",
    category: "admin",
    isOwnerOnly: true,
    async execute({ sock, jid, args, msg }) {
        const settings = getSettings();
        
        if (args[0] === "on") {
            settings.antiEdit = true;
        } else if (args[0] === "off") {
            settings.antiEdit = false;
        } else {
            settings.antiEdit = !settings.antiEdit;
        }

        await updateSettings(settings);
        return await sock.sendMessage(jid, { 
            text: `🛡️ *Anti-Edit* is now ${settings.antiEdit ? "✅ ON" : "❌ OFF"}\n\n_Original versions of edited messages will be sent to the owner's DM._` 
        }, { quoted: msg });
    }
};
