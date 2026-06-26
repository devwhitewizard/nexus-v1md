const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "anticall",
    aliases: ["rejectcall"],
    description: "Toggle automatic reject of incoming calls",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, args, msg }) => {
        const settings = getSettings();
        const action = args[0]?.toLowerCase().trim();

        if (!action) {
            const on = "✅ ON";
            const off = "❌ OFF";
            let help = `*📞 ANTI-CALL CONFIGURATION*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            help += `Automatically rejects all incoming voice and video calls.\n\n`;
            help += `💠 *Current Status:* ${settings.antiCall ? on : off}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.anticall on\` — Enable anti-call\n`;
            help += `▸ \`.anticall off\` — Disable anti-call`;
            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        if (action === "on") {
            await updateSettings({ antiCall: true });
            return await sock.sendMessage(jid, { text: "✅ *Anti-Call* is now *ON*. Incoming calls will be automatically rejected." }, { quoted: msg });
        } else if (action === "off") {
            await updateSettings({ antiCall: false });
            return await sock.sendMessage(jid, { text: "❌ *Anti-Call* is now *OFF*." }, { quoted: msg });
        } else {
            return await sock.sendMessage(jid, { text: "⚠️ Use `.anticall on` or `.anticall off`" }, { quoted: msg });
        }
    }
};
