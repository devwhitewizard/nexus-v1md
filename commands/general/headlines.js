const axios = require("axios");
const { KEITH_API_BASE, googleNewsTopic, formatArticles } = require("../../lib/newsHelper");

module.exports = {
    name: "headlines",
    description: "Get top global news headlines",
    category: "news",
    async execute({ sock, jid, msg }) {
        try {
            // Try Keith BBC top stories
            try {
                const res = await axios.get(`${KEITH_API_BASE}/news/bbc`, { timeout: 10000 });
                const stories = res.data?.result?.topStories || [];
                if (stories.length > 0) {
                    let text = `📰 *TOP GLOBAL HEADLINES*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                    stories.slice(0, 7).forEach((item, i) => {
                        text += `*#${i + 1}:* ${item.title}\n`;
                        if (item.url) text += `🔗 ${item.url}\n\n`;
                    });
                    text += `━━━━━━━━━━━━━━━━━━━`;
                    return await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } catch (_) {}

            // Google Top Headlines
            const articles = await googleNewsTopic("headlines?hl=en-US&gl=US&ceid=US:en");
            if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ Could not fetch news headlines right now." }, { quoted: msg });
            return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *TOP GLOBAL HEADLINES*", 7) }, { quoted: msg });
        } catch (err) {
            console.error("headlines command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching news headlines." }, { quoted: msg });
        }
    }
};
