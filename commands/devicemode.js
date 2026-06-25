const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "devicemode",
    aliases: ["device", "setdevice"],
    description: "Switch bot formatting mode between iPhone and Android",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const mode = args[0]?.toLowerCase().trim();

        if (mode !== "iphone" && mode !== "android") {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Usage: `.devicemode iphone/android`\n\n_iPhone mode displays plain text messages, Android mode unlocks full features (buttons, lists, etc.)_" 
            }, { quoted: msg });
        }

        const capitalized = mode === "iphone" ? "iPhone" : "Android";

        try {
            await updateSettings({ device: capitalized });
            await sock.sendMessage(jid, { 
                text: `✅ *Device Mode Updated:* Now set to *${capitalized}*.\n\n_Bot will now optimize formatting for ${capitalized} devices._` 
            }, { quoted: msg });
        } catch (err) {
            console.error("Device mode update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update device mode: ${err.message}` }, { quoted: msg });
        }
    }
};
