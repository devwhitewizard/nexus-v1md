const { updateSettings } = require("../../lib/settings");

module.exports = {
    name: "setgreet",
    aliases: ["setgreetdm", "setdmmsg"],
    description: "Sets the custom greeting message for unfamiliar contacts in DMs.",
    category: "owner",
    isOwnerOnly: true,
    async execute({ sock, jid, args, msg }) {
        const greetDMMsg = args.join(" ");
        if (!greetDMMsg) {
            return await sock.sendMessage(jid, { 
                text: "❓ *Usage:* `.setgreet <your message>`\n\nExample: `.setgreet Hello there! Thanks for texting me.`" 
            });
        }

        try {
            await updateSettings({ greetDMMsg });
            await sock.sendMessage(jid, { text: "✅ *Greet DM Message Updated:* Your new message has been saved!" });
        } catch (err) {
            console.error("setgreet error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to update greeting message." });
        }
    }
};
