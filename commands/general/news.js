const axios = require("axios");
const { KEITH_API_BASE, googleNewsSearch, formatArticles } = require("../../lib/newsHelper");

module.exports = {
    name: "news",
    description: "Search any news topic — e.g. .news Ruto or .news AI",
    category: "news",
    async execute({ sock, jid, msg, args }) {
        const query = args.join(" ").trim();

        if (!query) {
            const text =
                `📰 *NEWS SEARCH*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                `Use *.news <topic>* to search any news topic.\n\n` +
                `*Examples:*\n` +
                `  • \`.news Ruto\`\n` +
                `  • \`.news AI\`\n` +
                `  • \`.news Kenya floods\`\n\n` +
                `*Other News Commands:*\n` +
                `  • \`.bbcnews\` — BBC World News\n` +
                `  • \`.citizennews\` — Citizen Digital Kenya\n` +
                `  • \`.technews\` — Tech News\n` +
                `  • \`.cnn\` — CNN News\n` +
                `  • \`.headlines\` — Top Global Headlines\n` +
                `━━━━━━━━━━━━━━━━━━━`;
            return await sock.sendMessage(jid, { text }, { quoted: msg });
        }

        try {
            // Try Keith Kenyans search API first if available
            try {
                const res = await axios.get(`${KEITH_API_BASE}/news/kenyans/search?q=${encodeURIComponent(query)}`, { timeout: 10000 });
                const results = res.data?.result?.results || [];
                if (results.length > 0) {
                    let text = `📰 *NEWS: "${query.toUpperCase()}"*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                    results.slice(0, 7).forEach((item, i) => {
                        text += `*#${i + 1}:* ${item.title}\n`;
                        if (item.url) text += `🔗 ${item.url}\n`;
                        text += `\n`;
                    });
                    text += `━━━━━━━━━━━━━━━━━━━\n_Source: Kenyans.co.ke_`;
                    return await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } catch (_) {}

            // Primary Google News RSS Search
            const articles = await googleNewsSearch(query);
            if (articles.length === 0) {
                return await sock.sendMessage(jid, { text: `❌ No news results found for *"${query}"*. Try another keyword.` }, { quoted: msg });
            }

            return await sock.sendMessage(jid, {
                text: formatArticles(articles, `🔍 *NEWS: "${query.toUpperCase()}"*`)
            }, { quoted: msg });
        } catch (err) {
            console.error("News command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching news topic. Please try again." }, { quoted: msg });
        }
    }
};
