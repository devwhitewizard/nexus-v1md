const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "hideviewchannel",
    aliases: ["sethideviewchannel", "viewchannel", "channeltag", "channellink"],
    description: "Control clickable Channel tag / View Channel label on outgoing messages",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const input = args[0]?.toLowerCase().trim();

        const settings = getSettings();
        let hideValue;

        // Determine intent:
        // "on", "show", "enable" -> User wants View Channel ENABLED (hideViewChannel = false)
        // "off", "hide", "disable" -> User wants View Channel DISABLED (hideViewChannel = true)
        if (input === "on" || input === "show" || input === "enable" || input === "visible") {
            hideValue = false; // Show the channel tag
        } else if (input === "off" || input === "hide" || input === "disable" || input === "hidden") {
            hideValue = true;  // Hide the channel tag
        } else if (input === "toggle" || !input) {
            hideValue = !settings.hideViewChannel;
        } else {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:*\n▸ `.viewchannel on` (or `show`) — Enable View Channel tag on messages\n▸ `.viewchannel off` (or `hide`) — Disable View Channel tag on messages" 
            }, { quoted: msg });
        }

        try {
            await updateSettings({ hideViewChannel: hideValue });
            const statusText = !hideValue 
                ? "📢 *View Channel Banner:* **ENABLED & VISIBLE**\n\n_Clickable View Channel link will appear on all outgoing bot messages._" 
                : "🙈 *View Channel Banner:* **DISABLED & HIDDEN**\n\n_Channel link will NOT appear on outgoing bot messages._";
            
            await sock.sendMessage(jid, { text: `✅ ${statusText}` }, { quoted: msg });
        } catch (err) {
            console.error("HideViewChannel update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update view channel setting: ${err.message}` }, { quoted: msg });
        }
    }
};
