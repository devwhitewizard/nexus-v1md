const { getGroupHistory } = require("../../lib/messageModel");
const { askAI, checkAILimit } = require("../../lib/aiHelper");

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
            const prompt = `Summarize the following WhatsApp group discussion concisely in bullet points. Focus on the main topics and any decisions made. Keep it professional and brief.\n\nDISCUSSION:\n${chatLog}`;
            
            await sock.sendMessage(jid, { text: "🔍 *Reading through the chats and summarizing...* ⌛" }, { quoted: msg });

            const summary = await askAI(prompt, "You are Nexus-1MD, a highly intelligent group moderator. Your job is to summarize discussions so people can catch up quickly.");

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
