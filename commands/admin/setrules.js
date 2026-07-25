const { setRules } = require("../../database/rules");

module.exports = {
    name: "setrules",
    description: "Set/Update group rules.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const rules = args.join(" ");
        if (!rules) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.setrules [rules text]`" });

        try {
            await setRules(jid, rules);
            await sock.sendMessage(jid, { text: "✅ *Group Rules Saved:* Guidelines have been updated successfully." });
        } catch (err) {
            console.error("Setrules error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to save rules." });
        }
    }
};
