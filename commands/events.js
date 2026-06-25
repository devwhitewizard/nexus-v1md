const { getSettings, updateSettings } = require("../lib/settings");
const jsonStore = require("../lib/jsonStore");

module.exports = {
    name: "events",
    aliases: ["groupevents"],
    description: "Manage group welcome, goodbye, and promotion events",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const settings = getSettings();

        const action = args[0]?.toLowerCase().trim();

        if (!action) {
            let help = `🎭 *Group Events Control Panel*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            
            const localMode = jsonStore.get(`events_mode_${jid}`, null);
            const activeMode = localMode !== null ? (localMode === "on") : settings.groupEventsGlobal;

            help += `🔹 *Current Group Status:* ${activeMode ? "✅ ON" : "❌ OFF"}${localMode === null ? " _(Global Inherited)_" : ""}\n`;
            help += `🔹 *Global Mode:* ${settings.groupEventsGlobal ? "✅ ON" : "❌ OFF"}\n`;
            help += `🔹 *Promotion Alerts:* ${settings.eventsPromote ? "✅ ON" : "❌ OFF"}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.events on\` — Enable in this group\n`;
            help += `▸ \`.events off\` — Disable in this group\n`;
            help += `▸ \`.events on all\` — Enable in ALL groups\n`;
            help += `▸ \`.events off all\` — Disable in ALL groups\n`;
            help += `▸ \`.events promote on/off\` — Show promotion notices\n\n`;
            help += `▸ \`.events welcome <message>\` — Set welcome message\n`;
            help += `▸ \`.events welcome <message> all\` — Set for all groups\n`;
            help += `▸ \`.events goodbye <message>\` — Set goodbye message\n`;
            help += `▸ \`.events goodbye <message> all\` — Set for all groups\n\n`;
            help += `📝 *Placeholders:*\n`;
            help += `* @user — Mentions the member\n`;
            help += `* {group} — Group name\n`;
            help += `* {count} — Current member count\n`;
            help += `* {time} — Join/leave time\n`;
            help += `* {desc} — Group description`;

            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        // 1. Promote alerts toggle
        if (action === "promote") {
            const state = args[1]?.toLowerCase().trim();
            if (state === "on") {
                await updateSettings({ eventsPromote: true });
                return await sock.sendMessage(jid, { text: "✅ *Promotion Alerts:* Enabled globally." }, { quoted: msg });
            } else if (state === "off") {
                await updateSettings({ eventsPromote: false });
                return await sock.sendMessage(jid, { text: "✅ *Promotion Alerts:* Disabled globally." }, { quoted: msg });
            } else {
                return await sock.sendMessage(jid, { text: "⚠️ Use `.events promote on` or `.events promote off`" }, { quoted: msg });
            }
        }

        // 2. Enable/disable events
        if (action === "on" || action === "off") {
            const target = args[1]?.toLowerCase().trim();
            const stateVal = (action === "on");

            if (target === "all" || target === "global") {
                await updateSettings({ groupEventsGlobal: stateVal });
                return await sock.sendMessage(jid, { 
                    text: `✅ *Global Group Events:* Default status set to *${stateVal ? "ON" : "OFF"}* for all groups.` 
                }, { quoted: msg });
            } else {
                jsonStore.set(`events_mode_${jid}`, action);
                return await sock.sendMessage(jid, { 
                    text: `✅ *Group Events:* Status for this group is now set to *${action.toUpperCase()}*.` 
                }, { quoted: msg });
            }
        }

        // 3. Welcome / Goodbye messages setup
        if (action === "welcome" || action === "goodbye") {
            let msgText = args.slice(1).join(" ").trim();
            if (!msgText) {
                return await sock.sendMessage(jid, { 
                    text: `⚠️ Please specify a message template. Example:\n\`.events ${action} Welcome @user to {group}!\`` 
                }, { quoted: msg });
            }

            const isGlobal = msgText.toLowerCase().endsWith(" all");
            if (isGlobal) {
                msgText = msgText.slice(0, -4).trim();
            }

            if (isGlobal) {
                if (action === "welcome") {
                    await updateSettings({ welcomeMsg: msgText });
                } else {
                    await updateSettings({ goodbyeMsg: msgText });
                }
                return await sock.sendMessage(jid, { 
                    text: `✅ *Global Message Saved:* The default ${action} template is now set to:\n\n_${msgText}_` 
                }, { quoted: msg });
            } else {
                jsonStore.set(`${action}_msg_${jid}`, msgText);
                return await sock.sendMessage(jid, { 
                    text: `✅ *Group Message Saved:* The ${action} template for this group is now set to:\n\n_${msgText}_` 
                }, { quoted: msg });
            }
        }

        return await sock.sendMessage(jid, { text: "⚠️ Unknown subcommand. Type `.events` to see all available commands." }, { quoted: msg });
    }
};
