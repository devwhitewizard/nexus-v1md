const { cleanSessionFolder } = require("../../lib/sessionCleaner");

module.exports = {
    name: "clearsession",
    aliases: ["prunesession", "cleartemp"],
    description: "Clean up stale temporary files in the session folder.",
    category: "owner",
    isOwnerOnly: true,
    ownerOnly: true,
    async execute({ sock, jid, msg, args }) {
        try {
            await sock.sendMessage(jid, { text: "🧹 *Pruning session folder...* Please wait." }, { quoted: msg });
            
            // Allow overriding the max age via command arguments (e.g. .clearsession 12)
            let maxAgeHours = 24;
            if (args[0] && !isNaN(args[0])) {
                maxAgeHours = parseFloat(args[0]);
            }
            
            const deletedCount = cleanSessionFolder(maxAgeHours);
            
            return await sock.sendMessage(jid, {
                text: `✅ *Session Clean Completed!*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                     `🧹 *Pruned:* ${deletedCount} stale temporary files (older than ${maxAgeHours}h).\n` +
                     `💾 *Storage Status:* Optimized & clean.\n\n` +
                     `> Nexus-1MD Optimization`
            }, { quoted: msg });
        } catch (err) {
            console.error("Clear Session Command Error:", err);
            return await sock.sendMessage(jid, { text: "❌ *Error:* Failed to complete session pruning." }, { quoted: msg });
        }
    }
};
