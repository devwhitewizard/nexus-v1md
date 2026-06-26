const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "autoread",
    aliases: ["readstatus", "read"],
    description: "Manage auto-read setting for incoming messages",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, args, msg }) => {
        const settings = getSettings();
        const action = args[0]?.toLowerCase().trim();

        if (!action) {
            const on = "✅ ON";
            const off = "❌ OFF";
            let help = `*📖 AUTO READ CONFIGURATION*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            help += `Automatically marks all incoming messages as read (sends blue ticks immediately).\n\n`;
            help += `💠 *Current Status:* ${settings.autoRead ? on : off}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.autoread on\` — Enable auto-read\n`;
            help += `▸ \`.autoread off\` — Disable auto-read`;
            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        if (action === "on") {
            await updateSettings({ autoRead: true });
            return await sock.sendMessage(jid, { text: "✅ *Auto-Read* is now *ON*. Incoming messages will be marked as read immediately." }, { quoted: msg });
        } else if (action === "off") {
            await updateSettings({ autoRead: false });
            return await sock.sendMessage(jid, { text: "❌ *Auto-Read* is now *OFF*." }, { quoted: msg });
        } else {
            return await sock.sendMessage(jid, { text: "⚠️ Use `.autoread on` or `.autoread off`" }, { quoted: msg });
        }
    }
};
