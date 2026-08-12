const { askChat } = require("../../lib/aiHelper");

module.exports = {
    name: "chat",
    aliases: ["talk", "convo"],
    description: "Have a casual conversation with Nexus AI.",
    category: "ai",
    execute: async ({ sock, jid, args, msg }) => {
        const text = args.join(" ").trim();
        if (!text) {
            return await sock.sendMessage(jid, {
                text: "💬 *Usage:* `.chat <message>`\n\n_Example: `.chat How is your day?`_"
            });
        }

        try {
            await sock.sendMessage(jid, { react: { text: "💬", key: msg.key } });

            const reply = await askChat(text);

            await sock.sendMessage(jid, {
                text: `💬 *NEXUS CHAT*\n\n${reply}`
            }, { quoted: msg });

        } catch (err) {
            console.error("Chat error:", err);
            await sock.sendMessage(jid, { text: "⚠️ Chat AI is unavailable right now. Try again later." });
        }
    }
};
