const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "menustyle",
    aliases: ["setmenustyle"],
    description: "Switch menu layout style (1, 2, or 3)",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const style = parseInt(args[0]);

        if (style !== 1 && style !== 2 && style !== 3) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Usage: `.menustyle 1/2/3`\n\n*Styles:*\n▸ `1` — Lines menu layout\n▸ `2` — Interactive buttons menu layout\n▸ `3` — List choices menu layout" 
            }, { quoted: msg });
        }

        try {
            await updateSettings({ menuStyle: style });
            const styleName = style === 2 ? "Buttons" : style === 3 ? "List" : "Lines";
            await sock.sendMessage(jid, { text: `✅ *Menu Style Updated:* Now set to *Style ${style} — ${styleName}*.` }, { quoted: msg });
        } catch (err) {
            console.error("Menu style change error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update menu style: ${err.message}` }, { quoted: msg });
        }
    }
};
