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
        let newValue;

        if (input === "on" || input === "hide" || input === "true" || input === "enable") {
            newValue = true;  // Hide the channel tag
        } else if (input === "off" || input === "show" || input === "false" || input === "disable") {
            newValue = false; // Show the channel tag
        } else if (input === "toggle" || !input) {
            newValue = !settings.hideViewChannel;
        } else {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:*\n▸ `.hideviewchannel show` (or `off`) — Show the View Channel link on messages\n▸ `.hideviewchannel hide` (or `on`) — Hide the View Channel link on messages" 
            }, { quoted: msg });
        }

        try {
            await updateSettings({ hideViewChannel: newValue });
            const statusText = newValue 
                ? "🙈 *View Channel Banner:* **HIDDEN**\n\n_Channel link will NOT appear on outgoing bot messages._" 
                : "📢 *View Channel Banner:* **VISIBLE**\n\n_Clickable View Channel link will be displayed on outgoing bot messages._";
            
            await sock.sendMessage(jid, { text: `✅ ${statusText}` }, { quoted: msg });
        } catch (err) {
            console.error("HideViewChannel update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update hide view channel: ${err.message}` }, { quoted: msg });
        }
    }
};
