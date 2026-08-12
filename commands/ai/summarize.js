const { getGroupHistory } = require("../../nexus/messageModel");
const { askSummarize, checkAILimit } = require("../../lib/aiHelper");

module.exports = {
    name: "summarize",
    aliases: ["summary", "digest"],
    description: "Summarize the last 50 messages in the group.",
    category: "ai",
    groupOnly: true,
    async execute({ sock, jid, msg, sender }) {
        try {
            // 🛡️ Rate Limit Check
            const limit = checkAILimit(sender);
            if (!limit.allowed) {
                return await sock.sendMessage(jid, { text: limit.reason }, { quoted: msg });
            }

            await sock.sendMessage(jid, { react: { text: "📖", key: msg.key } });
            
            const history = await getGroupHistory(jid, 50);
            
            if (!history || history.length < 5) {
                return await sock.sendMessage(jid, { 
                    text: "❌ *Not enough discussion yet.* I need at least 5-10 messages to generate a meaningful summary." 
                }, { quoted: msg });
            }

            const chatLog = history.map(h => `${h.name}: ${h.text}`).join("\n");
            await sock.sendMessage(jid, { text: "🔍 *Reading through the chats and summarizing...* ⌛" }, { quoted: msg });

            const summary = await askSummarize(chatLog);

            const response = 
                `📖 *DISCUSSION SUMMARY (Last 50 Chats)*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                `${summary}\n\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `_Nexus-1MD AI Intel_`;

            await sock.sendMessage(jid, { text: response }, { quoted: msg });

        } catch (error) {
            console.error("Summarize Command Error:", error);
            await sock.sendMessage(jid, { text: "⚠️ AI Summarization is currently unavailable. Try again later." });
        }
    }
};
