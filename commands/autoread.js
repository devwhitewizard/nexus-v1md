const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "autoread",
    aliases: ["readstatus", "read", "presence"],
    description: "Manage Auto-Read & Presence configuration",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, args, msg }) => {
        const settings = getSettings();
        const on = "✅ ON";
        const off = "❌ OFF";

        const action = args[0]?.toLowerCase().trim();
        const value = args[1]?.toLowerCase().trim();

        // Helper to format reply text
        const getDashboard = () => {
            let help = `*📖 AUTO-READ & PRESENCE CONFIGURATION*\n`;
            help += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            help += `💠 *Auto Read (Blue ticks):* ${settings.autoRead ? on : off}\n`;
            help += `💠 *Auto Type (Composing...):* ${settings.autoType ? on : off}\n`;
            help += `💠 *Auto Record (Recording...):* ${settings.autoRecord ? on : off}\n`;
            help += `💠 *Always Online (Available):* ${settings.alwaysOnline ? on : off}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.autoread read <on/off>\` — Toggle/Set Auto Read\n`;
            help += `▸ \`.autoread type <on/off>\` — Toggle/Set Auto Type\n`;
            help += `▸ \`.autoread record <on/off>\` — Toggle/Set Auto Record\n`;
            help += `▸ \`.autoread online <on/off>\` — Toggle/Set Always Online\n`;
            help += `▸ \`.autoread <on/off>\` — Direct toggle for Auto Read\n\n`;
            help += `_Note: The typing/recording/online effects are disabled by default._`;
            return help;
        };

        if (!action) {
            return await sock.sendMessage(jid, { text: getDashboard() }, { quoted: msg });
        }

        let key = null;
        let label = "";

        if (action === "read") {
            key = "autoRead";
            label = "Auto Read";
        } else if (action === "type") {
            key = "autoType";
            label = "Auto Type (Composing)";
        } else if (action === "record") {
            key = "autoRecord";
            label = "Auto Record (Recording)";
        } else if (action === "online") {
            key = "alwaysOnline";
            label = "Always Online (Available)";
        } else if (action === "on") {
            await updateSettings({ autoRead: true });
            return await sock.sendMessage(jid, { text: `✅ *Auto Read* is now *ON*.\n\n_Note: Composing/Recording/Online status remains unchanged (disabled by default)._` }, { quoted: msg });
        } else if (action === "off") {
            await updateSettings({ autoRead: false });
            return await sock.sendMessage(jid, { text: `❌ *Auto Read* is now *OFF*.` }, { quoted: msg });
        } else {
            return await sock.sendMessage(jid, { text: `⚠️ Invalid option. Use \`.autoread\` to view commands.` }, { quoted: msg });
        }

        if (key) {
            let nextVal;
            if (value === "on") nextVal = true;
            else if (value === "off") nextVal = false;
            else nextVal = !settings[key]; // toggle if no valid value provided

            await updateSettings({ [key]: nextVal });

            // Apply presence update immediately for alwaysOnline
            if (key === "alwaysOnline") {
                await sock.sendPresenceUpdate(nextVal ? "available" : "unavailable").catch(() => {});
            }

            return await sock.sendMessage(jid, { 
                text: `${nextVal ? "✅" : "❌"} *${label}* is now *${nextVal ? "ON" : "OFF"}*.` 
            }, { quoted: msg });
        }
    }
};
