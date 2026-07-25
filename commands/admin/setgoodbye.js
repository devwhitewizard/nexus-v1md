const { updateSettings } = require("../../lib/settings");

module.exports = {
    name: "setgoodbye",
    description: "Sets the custom goodbye message for the group.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const goodbyeMsg = args.join(" ");
        if (!goodbyeMsg) {
            return await sock.sendMessage(jid, { 
                text: "❓ *Usage:* `.setgoodbye Goodbye @user, we will miss you!`\n\n" +
                      "Available variables: `@user`, `@group`" 
            });
        }

        try {
            await updateSettings({ goodbyeMsg });
            await sock.sendMessage(jid, { text: "✅ *Goodbye Message Updated:* Your new message has been saved!" });
        } catch (err) {
            console.error("setgoodbye error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to update goodbye message." });
        }
    }
};
