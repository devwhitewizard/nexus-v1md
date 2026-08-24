const { updateSettings } = require("../../lib/settings");

module.exports = {
    name: "setwelcome",
    description: "Sets the custom welcome message for the group.",
    category: "admin",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        const welcomeMsg = args.join(" ");
        if (!welcomeMsg) {
            return await sock.sendMessage(jid, { 
                text: "❓ *Usage:* `.setwelcome <message>`\n\n" +
                      "Available variables: `@user`, `@group`, `{count}`, `{date}`, `{time}`, `{desc}`" 
            });
        }

        try {
            await updateSettings({ welcomeMsg });
            await sock.sendMessage(jid, { text: "✅ *Welcome Message Updated:* Your new message has been saved!" });
        } catch (err) {
            console.error("setwelcome error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to update welcome message." });
        }
    }
};
