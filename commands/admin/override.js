const { setGame } = require("../../lib/gameState");

module.exports = {
    name: "override",
    aliases: ["emergency", "reset"],
    description: "Admin emergency command to clear states and caches.",
    category: "admin",
    adminOnly: true,
    execute: async ({ sock, jid, msg, sender, args }) => {
        const action = args[0]?.toLowerCase();

        if (!action) {
            return await sock.sendMessage(jid, { 
                text: `🛑 *NEXUS OVERRIDE SUB-MENU*\n\n` +
                      `1. \`.override games\` - Clear active game sessions in this chat\n` +
                      `2. \`.override cache\` - Performance reset (mock)\n` +
                      `3. \`.override all\` - Global reset attempt\n\n` +
                      `⚠️ *Use with caution!*`
            });
        }

        try {
            if (action === "games") {
                // gameState.js exports setGame, we can use it to clear
                const { setGame } = require("../../lib/gameState");
                setGame(jid, null, null); // Clear session
                await sock.sendMessage(jid, { text: "✅ *Override:* All game sessions for this chat have been terminated." });
            } 
            else if (action === "cache") {
                await sock.sendMessage(jid, { text: "♻️ *Override:* Internal process cache cleared." });
            }
            else {
                await sock.sendMessage(jid, { text: "❌ Invalid override parameter." });
            }
        } catch (err) {
            await sock.sendMessage(jid, { text: "❌ Override failed." });
        }
    }
};
