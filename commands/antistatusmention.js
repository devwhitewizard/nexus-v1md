const { getSettings, updateSettings } = require("../lib/settings");
const jsonStore = require("../lib/jsonStore");

module.exports = {
    name: "antistatusmention",
    aliases: ["antistatus", "antitag"],
    description: "Manage group or global anti-status-mention protection",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const settings = getSettings();

        const action = args[0]?.toLowerCase().trim();
        const target = args[1]?.toLowerCase().trim();

        if (!action) {
            let help = `🏷️ *Anti-Status-Mention Control Panel*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            
            const localMode = jsonStore.get(`antistatusmention_mode_${jid}`, null);
            const activeMode = localMode !== null ? localMode : (settings.antiStatusMentionGlobal || "off");

            help += `🔹 *Current Group Mode:* ${activeMode.toUpperCase()}${localMode === null ? " _(Global Inherited)_" : ""}\n`;
            help += `🔹 *Global Mode:* ${settings.antiStatusMentionGlobal.toUpperCase()}\n`;
            help += `🔹 *Warn Limit:* ${settings.antiStatusMentionLimit || 3}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.antistatusmention warn\` — Warn mode\n`;
            help += `▸ \`.antistatusmention delete\` — Delete + Warn mode\n`;
            help += `▸ \`.antistatusmention remove\` — Kick immediately\n`;
            help += `▸ \`.antistatusmention off\` — Disable for this group\n\n`;
            help += `▸ \`.antistatusmention <mode> all\` — Enable globally for ALL groups\n`;
            help += `▸ \`.antistatusmention limit <1-10>\` — Set warn limit before kick\n`;
            help += `▸ \`.antistatusmention resetwarns\` — Reset warning counts for this group`;

            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        const validModes = ["warn", "delete", "remove", "off"];

        // 1. Reset Warnings
        if (action === "resetwarns" || action === "resetwarn" || action === "clearwarns") {
            const cache = jsonStore.getAll();
            const prefix = `antistatusmention_warns_${jid}_`;
            let clearedCount = 0;

            for (const key in cache) {
                if (key.startsWith(prefix)) {
                    delete cache[key];
                    clearedCount++;
                }
            }
            if (clearedCount > 0) {
                jsonStore.save();
            }

            return await sock.sendMessage(jid, { text: `✅ *Warnings Reset:* Cleared warning counts for all members in this group.` }, { quoted: msg });
        }

        // 2. Limit Configuration
        if (action === "limit" || action === "warnlimit") {
            const limit = parseInt(args[1]);
            if (isNaN(limit) || limit < 1 || limit > 10) {
                return await sock.sendMessage(jid, { text: "⚠️ Please specify a valid warn limit between 1 and 10." }, { quoted: msg });
            }

            await updateSettings({ antiStatusMentionLimit: limit });
            return await sock.sendMessage(jid, { text: `✅ *Warn Limit Updated:* Members will be removed after *${limit}* warnings.` }, { quoted: msg });
        }

        // 3. Modes Configuration
        if (validModes.includes(action)) {
            if (target === "all" || target === "global") {
                // Global setting
                await updateSettings({ antiStatusMentionGlobal: action });
                return await sock.sendMessage(jid, { 
                    text: `✅ *Global Anti-Status-Mention Updated:* All groups default mode is now set to *${action.toUpperCase()}* (unless overridden locally).` 
                }, { quoted: msg });
            } else {
                // Group specific setting
                jsonStore.set(`antistatusmention_mode_${jid}`, action);
                return await sock.sendMessage(jid, { 
                    text: `✅ *Anti-Status-Mention Updated:* This group mode is now set to *${action.toUpperCase()}*.` 
                }, { quoted: msg });
            }
        }

        return await sock.sendMessage(jid, { text: "⚠️ Unknown subcommand. Type `.antistatusmention` to see all available commands." }, { quoted: msg });
    }
};
