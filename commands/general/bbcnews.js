const axios = require("axios");
const { KEITH_API_BASE, googleNewsSearch, googleNewsTopic, formatArticles } = require("../../lib/newsHelper");

module.exports = {
    name: "bbcnews",
    description: "Get latest BBC World News headlines",
    category: "news",
    async execute({ sock, jid, msg }) {
        try {
            // Try Keith API
            try {
                const res = await axios.get(`${KEITH_API_BASE}/news/bbc`, { timeout: 10000 });
                const stories = res.data?.result?.topStories || [];
                if (stories.length > 0) {
                    let text = `📰 *BBC NEWS HEADLINES*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                    stories.slice(0, 7).forEach((item, i) => {
                        text += `*#${i + 1}:* ${item.title}\n`;
                        if (item.description) text += `📝 ${item.description.slice(0, 120)}...\n`;
                        if (item.url) text += `🔗 ${item.url}\n`;
                        text += `\n`;
                    });
                    text += `━━━━━━━━━━━━━━━━━━━`;
                    return await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } catch (_) {}

            // Google RSS fallback
            let articles = await googleNewsSearch("BBC News site:bbc.com OR site:bbc.co.uk");
            if (articles.length === 0) articles = await googleNewsTopic("headlines?hl=en-US&gl=US&ceid=US:en");
            if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No BBC news found right now." }, { quoted: msg });
            return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *BBC NEWS HEADLINES*") }, { quoted: msg });
        } catch (err) {
            console.error("bbcnews command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching BBC news." }, { quoted: msg });
        }
    }
};
