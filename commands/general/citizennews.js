const axios = require("axios");
const { KEITH_API_BASE, googleNewsSearch, formatArticles } = require("../../lib/newsHelper");

module.exports = {
    name: "citizennews",
    description: "Get latest Citizen Digital news headlines",
    category: "news",
    async execute({ sock, jid, msg }) {
        try {
            try {
                const res = await axios.get(`${KEITH_API_BASE}/news/citizen`, { timeout: 10000 });
                const stories = res.data?.result?.topStories || res.data?.result?.pinnedStories || [];
                if (stories.length > 0) {
                    let text = `📰 *CITIZEN DIGITAL NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                    stories.slice(0, 7).forEach((item, i) => {
                        text += `*#${i + 1}:* ${item.title || item.name}\n`;
                        if (item.url) text += `🔗 ${item.url}\n`;
                        text += `\n`;
                    });
                    text += `━━━━━━━━━━━━━━━━━━━`;
                    return await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } catch (_) {}

            const articles = await googleNewsSearch("Citizen Digital Kenya site:citizentv.co.ke OR Citizen TV Kenya");
            if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No Citizen news found right now." }, { quoted: msg });
            return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *CITIZEN DIGITAL NEWS*") }, { quoted: msg });
        } catch (err) {
            console.error("citizennews command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching Citizen news." }, { quoted: msg });
        }
    }
};
