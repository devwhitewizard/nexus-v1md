const { getSettings, updateSettings } = require("../../lib/settings");
const jsonStore = require("../../lib/jsonStore");

module.exports = {
    name: "antilink",
    aliases: ["antilinks"],
    description: "Manage group or global anti-link protection",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const settings = getSettings();

        const action = args[0]?.toLowerCase().trim();
        const target = args[1]?.toLowerCase().trim();

        if (!action) {
            let help = `⚙️ *Anti-Link Control Panel*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            
            const localMode = jsonStore.get(`antilink_mode_${jid}`, null);
            const activeMode = localMode !== null ? localMode : (settings.antiLinkGlobal || "off");

            help += `🔹 *Current Group Mode:* ${activeMode.toUpperCase()}${localMode === null ? " _(Global Inherited)_" : ""}\n`;
            help += `🔹 *Global Mode:* ${settings.antiLinkGlobal.toUpperCase()}\n`;
            help += `🔹 *Warn Limit:* ${settings.antiLinkLimit || 3}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.antilink warn\` — Warn mode\n`;
            help += `▸ \`.antilink delete\` — Delete + Warn mode\n`;
            help += `▸ \`.antilink remove\` — Kick immediately\n`;
            help += `▸ \`.antilink off\` — Disable for this group\n\n`;
            help += `▸ \`.antilink <mode> all\` — Enable globally for ALL groups\n`;
            help += `▸ \`.antilink limit <1-10>\` — Set warn limit before kick\n`;
            help += `▸ \`.antilink resetwarns\` — Reset warning counts for this group`;

            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        const validModes = ["warn", "delete", "remove", "off"];

        // 1. Reset Warnings
        if (action === "resetwarns" || action === "resetwarn" || action === "clearwarns") {
            const cache = jsonStore.getAll();
            const prefix = `antilink_warns_${jid}_`;
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

            await updateSettings({ antiLinkLimit: limit });
            return await sock.sendMessage(jid, { text: `✅ *Warn Limit Updated:* Members will be removed after *${limit}* warnings.` }, { quoted: msg });
        }

        // 3. Modes Configuration
        if (validModes.includes(action)) {
            if (target === "all" || target === "global") {
                // Global setting
                await updateSettings({ antiLinkGlobal: action });
                return await sock.sendMessage(jid, { 
                    text: `✅ *Global Anti-Link Updated:* All groups default mode is now set to *${action.toUpperCase()}* (unless overridden locally).` 
                }, { quoted: msg });
            } else {
                // Group specific setting
                jsonStore.set(`antilink_mode_${jid}`, action);
                return await sock.sendMessage(jid, { 
                    text: `✅ *Anti-Link Updated:* This group mode is now set to *${action.toUpperCase()}*.` 
                }, { quoted: msg });
            }
        }

        return await sock.sendMessage(jid, { text: "⚠️ Unknown subcommand. Type `.antilink` to see all available commands." }, { quoted: msg });
    }
};
