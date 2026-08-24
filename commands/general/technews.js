const axios = require("axios");
const { KEITH_API_BASE, googleNewsSearch, googleNewsTopic, formatArticles } = require("../../lib/newsHelper");

module.exports = {
    name: "technews",
    description: "Get latest technology news headlines",
    category: "news",
    async execute({ sock, jid, msg }) {
        try {
            try {
                const res = await axios.get(`${KEITH_API_BASE}/news/tech`, { timeout: 10000 });
                const articles = res.data?.result?.featuredArticles || res.data?.result?.articles || [];
                if (articles.length > 0) {
                    let text = `💻 *LATEST TECH NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                    articles.slice(0, 7).forEach((item, i) => {
                        text += `*#${i + 1}:* ${item.title}\n`;
                        if (item.description) text += `📝 ${item.description.slice(0, 120)}...\n`;
                        if (item.link || item.url) text += `🔗 ${item.link || item.url}\n`;
                        text += `\n`;
                    });
                    text += `━━━━━━━━━━━━━━━━━━━`;
                    return await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } catch (_) {}

            let articles = await googleNewsTopic("topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0YVdjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en");
            if (articles.length === 0) articles = await googleNewsSearch("latest technology news AI gadgets");
            if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No tech news found right now." }, { quoted: msg });
            return await sock.sendMessage(jid, { text: formatArticles(articles, "💻 *LATEST TECH NEWS*") }, { quoted: msg });
        } catch (err) {
            console.error("technews command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching tech news." }, { quoted: msg });
        }
    }
};
