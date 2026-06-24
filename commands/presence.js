const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "presence",
    aliases: ["setpresence"],
    description: "Control typing presence indicator in DMs and groups",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, args, msg }) => {
        const settings = getSettings();
        const target = args[0]?.toLowerCase(); // "dm" or "grp"
        const state  = args[1]?.toLowerCase(); // "on" or "off"

        // ── No args → show current status ─────────────────────────────────────
        if (!target) {
            const on = "✅ ON"; const off = "❌ OFF";
            return await sock.sendMessage(jid, {
                text: `*🔄 PRESENCE*\n${"─".repeat(28)}\n\nShows a typing indicator whenever someone messages you.\n\n💠 *DM Presence:* ${settings.dmPresence ? on : off}\n💠 *Group Presence:* ${settings.groupPresence ? on : off}\n\n🔧 *Usage:*\n▸ \`.presence dm on\` — Enable in DMs\n▸ \`.presence dm off\` — Disable in DMs\n▸ \`.presence grp on\` — Enable in groups\n▸ \`.presence grp off\` — Disable in groups`
            }, { quoted: msg });
        }

        const enable = state === "on" ? true : state === "off" ? false : null;

        if (enable === null || !["dm", "grp"].includes(target)) {
            return await sock.sendMessage(jid, {
                text: `⚠️ *Usage:* \`.presence <dm|grp> <on|off>\`\n\nExamples:\n▸ \`.presence dm on\`\n▸ \`.presence grp off\``
            }, { quoted: msg });
        }

        const key = target === "dm" ? "dmPresence" : "groupPresence";
        const label = target === "dm" ? "DM Presence" : "Group Presence";

        await updateSettings({ [key]: enable });
        return await sock.sendMessage(jid, {
            text: `${enable ? "✅" : "❌"} *${label} is now ${enable ? "ON" : "OFF"}.*`
        }, { quoted: msg });
    }
};
