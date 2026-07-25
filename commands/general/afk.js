const { setAfk } = require("../../lib/afk");

module.exports = {
    name: "afk",
    aliases: ["unafk", "away"],
    description: "Sets your status to AFK (Away From Keyboard).",
    category: "general",
    async execute({ sock, jid, sender, args, msg }) {
        const reason = args.join(" ") || "No reason provided";
        setAfk(jid, sender, reason);

        await sock.sendMessage(jid, { 
            text: `💤 *@${sender.split("@")[0]} is now AFK!*\n📝 *Reason:* ${reason}`,
            mentions: [sender]
        }, { quoted: msg });
    }
};
