const { googleNewsSearch, formatArticles } = require("../../lib/newsHelper");

module.exports = {
    name: "cnn",
    description: "Get latest CNN news headlines",
    category: "news",
    async execute({ sock, jid, msg }) {
        try {
            const articles = await googleNewsSearch("CNN news site:cnn.com");
            if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No CNN news found right now." }, { quoted: msg });
            return await sock.sendMessage(jid, { text: formatArticles(articles, "📺 *CNN NEWS*") }, { quoted: msg });
        } catch (err) {
            console.error("cnn command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching CNN news." }, { quoted: msg });
        }
    }
};
