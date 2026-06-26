const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "chatbot",
    aliases: ["aichatbot", "ai-reply"],
    description: "Toggle automatic Gemini AI replies in private messages",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, args, msg }) => {
        const settings = getSettings();
        const action = args[0]?.toLowerCase().trim();

        if (!action) {
            const on = "✅ ON";
            const off = "❌ OFF";
            let help = `*🤖 CHATBOT (AI) CONFIGURATION*\n`;
            help += `━━━━━━━━━━━━━━━━━━\n\n`;
            help += `Enables AI-powered automatic replies to private messages using Gemini AI.\n\n`;
            help += `💠 *Current Status:* ${settings.chatbotAI ? on : off}\n\n`;
            help += `🔧 *Commands:*\n`;
            help += `▸ \`.chatbot on\` — Enable AI chatbot\n`;
            help += `▸ \`.chatbot off\` — Disable AI chatbot`;
            return await sock.sendMessage(jid, { text: help }, { quoted: msg });
        }

        if (action === "on") {
            await updateSettings({ chatbotAI: true });
            return await sock.sendMessage(jid, { text: "✅ *Chatbot (AI)* is now *ON*. AI will automatically reply in DMs." }, { quoted: msg });
        } else if (action === "off") {
            await updateSettings({ chatbotAI: false });
            return await sock.sendMessage(jid, { text: "❌ *Chatbot (AI)* is now *OFF*." }, { quoted: msg });
        } else {
            return await sock.sendMessage(jid, { text: "⚠️ Use `.chatbot on` or `.chatbot off`" }, { quoted: msg });
        }
    }
};
