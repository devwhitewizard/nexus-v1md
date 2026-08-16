const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "mode",
    aliases: ["botmode", "public", "private"],
    description: "Switch or view bot work mode (Public / Private)",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const settings = getSettings();
        const input = args[0]?.toLowerCase().trim();

        // 1. If no argument passed (or .mode status / .mode info), display dashboard without toggling
        if (!input || input === "status" || input === "info") {
            const modeStatus = settings.publicMode ? "🔓 **PUBLIC**" : "🔒 **PRIVATE**";
            const modeDesc = settings.publicMode 
                ? "_Everyone in groups and DMs can use bot commands._" 
                : "_Only bot owners and sudo users can use commands._";

            let menuText = `🤖 *BOT WORK MODE DASHBOARD* 🤖\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━\n\n`;
            menuText += `📌 *Current Mode:* ${modeStatus}\n`;
            menuText += `📝 ${modeDesc}\n\n`;
            menuText += `⚙️ *To Change Mode, Reply With:*\n`;
            menuText += `▸ \`.mode public\` (or \`.public\`) — Allow everyone to use bot\n`;
            menuText += `▸ \`.mode private\` (or \`.private\`) — Restrict bot to owners only\n`;
            menuText += `▸ \`.mode toggle\` — Switch current mode`;

            return await sock.sendMessage(jid, { text: menuText }, { quoted: msg });
        }

        // 2. Change mode if explicit argument provided
        let newMode = settings.publicMode;

        if (input === "public" || input === "on") {
            newMode = true;
        } else if (input === "private" || input === "off") {
            newMode = false;
        } else if (input === "toggle") {
            newMode = !settings.publicMode;
        } else {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Invalid mode.* Use `.mode public`, `.mode private`, or `.mode toggle`." 
            }, { quoted: msg });
        }

        await updateSettings({ publicMode: newMode });

        const status = newMode ? "🔓 *PUBLIC*" : "🔒 *PRIVATE*";
        await sock.sendMessage(jid, { 
            text: `✅ *Bot Mode Updated*\n\nThe bot is now in ${status} mode.\n${newMode ? "_Everyone can now use commands._" : "_Only owners can use commands._"}` 
        }, { quoted: msg });
    }
};
