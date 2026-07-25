const axios = require("axios");

module.exports = {
    name: "news",
    description: "Get latest global headlines.",
    category: "general",
    async execute({ sock, jid, msg, args }) {
        const source = args[0]?.toLowerCase() || 'cnn'; // Default to CNN
        const validSources = ['cnn', 'bbc', 'verge'];
        
        if (args[0] && !validSources.includes(source)) {
            return await sock.sendMessage(jid, { 
                text: `❓ *Usage:* \`.news <cnn|bbc|verge>\`\n_Defaulting to CNN..._` 
            }, { quoted: msg });
        }

        const sourceUrls = {
            cnn: "https://saurav.tech/NewsAPI/everything/cnn.json",
            bbc: "https://saurav.tech/NewsAPI/everything/bbc-news.json",
            verge: "https://saurav.tech/NewsAPI/everything/the-verge.json"
        };

        const endpoint = sourceUrls[source];

        try {
            const { data } = await axios.get(endpoint);
            const articles = data?.articles;
            
            if (!articles || articles.length === 0) {
                return await sock.sendMessage(jid, { text: `❌ No news found from *${source.toUpperCase()}* at the moment.` }, { quoted: msg });
            }

            let response = `📰 *NEWS HEADLINES: ${source.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━\n\n`;
            articles.slice(0, 5).forEach((news, i) => {
                response += `*#${i + 1}:* ${news.title}\n🔗 ${news.url || ""}\n\n`;
            });

            await sock.sendMessage(jid, { text: response + `━━━━━━━━━━━━━━━━━━━\n_Source: Saurav Tech News_` }, { quoted: msg });
        } catch (err) {
            console.error("News error:", err);
            await sock.sendMessage(jid, { text: "❌ Error fetching news headlines." }, { quoted: msg });
        }
    }
};
