const { askExplain } = require("../../lib/aiHelper");

module.exports = {
    name: "explain",
    aliases: ["wtf", "whatis", "definition"],
    description: "Get a clear explanation of any topic.",
    category: "ai",
    execute: async ({ sock, jid, args, msg }) => {
        const topic = args.join(" ").trim();
        if (!topic) {
            return await sock.sendMessage(jid, {
                text:
                    "📖 *Usage:* `.explain <topic>`\n\n" +
                    "*Examples:*\n" +
                    "• `.explain blockchain`\n" +
                    "• `.explain how WiFi works`\n" +
                    "• `.explain Newton's third law`"
            });
        }

        try {
            await sock.sendMessage(jid, { react: { text: "📖", key: msg.key } });
            await sock.sendMessage(jid, { text: `📖 Looking up: _"${topic}"_... ⏳` });

            const result = await askExplain(topic);

            await sock.sendMessage(jid, {
                text:
                    `📖 *NEXUS EXPLAINER*\n\n` +
                    `🔍 *Topic:* ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `${result}\n` +
                    `━━━━━━━━━━━━━━━━\n\n` +
                    `_Nexus-1MD Knowledge Base_`
            }, { quoted: msg });

        } catch (err) {
            console.error("Explain error:", err);
            await sock.sendMessage(jid, { text: "⚠️ Could not fetch explanation. Try again later." });
        }
    }
};
