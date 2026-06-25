const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "hideviewchannel",
    aliases: ["sethideviewchannel"],
    description: "Toggle hide view channel and forwarded labels on/off",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const input = args[0]?.toLowerCase().trim();

        if (input !== "on" && input !== "off" && input !== "toggle" && input !== undefined) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.hideviewchannel on/off`" }, { quoted: msg });
        }

        const settings = getSettings();
        let newValue = !settings.hideViewChannel; // Default to toggle if undefined or 'toggle'

        if (input === "on") newValue = true;
        if (input === "off") newValue = false;

        try {
            await updateSettings({ hideViewChannel: newValue });
            await sock.sendMessage(jid, { text: `✅ *Hide View Channel Status:* Now *${newValue ? "ON" : "OFF"}*.` }, { quoted: msg });
        } catch (err) {
            console.error("HideViewChannel update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update hide view channel: ${err.message}` }, { quoted: msg });
        }
    }
};
