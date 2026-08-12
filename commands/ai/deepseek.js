const { askDeepseek, checkAILimit } = require("../../lib/aiHelper");

module.exports = {
    name: "deepseek",
    aliases: ["ds", "deepseekai", "guru"],
    description: "Ask DeepSeek V3 AI (powered by GuruTech).",
    category: "ai",
    execute: async (ctx) => {
        const { sock, jid, args, msg, sender } = ctx;
        const query = args.join(" ").trim();

        if (!query) {
            return await sock.sendMessage(jid, {
                text:
                    "🔮 *DeepSeek V3 (GuruTech)*\n\n" +
                    "❓ *Usage:* `.deepseek <query>`\n\n" +
                    "*Examples:*\n" +
                    "• `.ds Solve 2x + 5 = 15`\n" +
                    "• `.deepseek Write a Python scraper`\n" +
                    "• `.guru Explain quantum computing`"
            }, { quoted: msg });
        }

        try {
            const limit = checkAILimit(sender);
            if (!limit.allowed) {
                return await sock.sendMessage(jid, { text: limit.reason }, { quoted: msg });
            }

            await sock.sendMessage(jid, { react: { text: "🔮", key: msg.key } });

            const answer = await askDeepseek(query);

            await sock.sendMessage(jid, {
                text: `🔮 *DEEPSEEK V3 (GuruTech)*\n\n${answer}`
            }, { quoted: msg });

        } catch (err) {
            console.error("DeepSeek command error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to reach DeepSeek AI service. Please try again later." }, { quoted: msg });
        }
    }
};
