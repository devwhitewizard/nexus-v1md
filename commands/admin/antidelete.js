const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "antidelete",
    aliases: ["antidel"],
    description: "Manage message and status anti-delete features",
    category: "admin",
    isOwnerOnly: true,
    async execute({ sock, jid, args, msg }) {
        const settings = getSettings();
        const action = args[0]?.toLowerCase().trim();
        const sub = args[1]?.toLowerCase().trim();

        if (!action) {
            const on = "✅ ON";
            const off = "❌ OFF";
            let help = `*🗑️ ANTI-DELETE DASHBOARD*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            help += `Recovers deleted messages or status updates and sends them to your personal DM.\n\n`;
            help += `💠 *Message Anti-Delete:* ${settings.antiDelete ? on : off}\n`;
            help += `💠 *Status Anti-Delete:* ${settings.statusAntiDelete ? on : off}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.antidelete on\` — Enable message recovery\n`;
            help += `▸ \`.antidelete off\` — Disable message recovery\n`;
            help += `▸ \`.antidelete status on\` — Enable status recovery\n`;
            help += `▸ \`.antidelete status off\` — Disable status recovery`;
            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        if (action === "status") {
            const state = sub === "on" ? true : sub === "off" ? false : !settings.statusAntiDelete;
            await updateSettings({ statusAntiDelete: state });
            return await sock.sendMessage(jid, { 
                text: `📊 *Status Anti-Delete* is now ${state ? "✅ ON" : "❌ OFF"}\n\n_Deleted status updates will be forwarded to your DM._` 
            }, { quoted: msg });
        }

        if (action === "on") {
            await updateSettings({ antiDelete: true });
            return await sock.sendMessage(jid, { 
                text: `🛡️ *Message Anti-Delete* is now *✅ ON*` 
            }, { quoted: msg });
        }

        if (action === "off") {
            await updateSettings({ antiDelete: false });
            return await sock.sendMessage(jid, { 
                text: `🛡️ *Message Anti-Delete* is now *❌ OFF*` 
            }, { quoted: msg });
        }

        // Default fallback/toggle if action is unknown
        const state = !settings.antiDelete;
        await updateSettings({ antiDelete: state });
        return await sock.sendMessage(jid, { 
            text: `🛡️ *Message Anti-Delete* is now ${state ? "✅ ON" : "❌ OFF"}` 
        }, { quoted: msg });
    }
};
