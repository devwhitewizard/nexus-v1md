const axios = require("axios");

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

// Fallback helper using Saurav.tech NewsAPI (previous API)
const getFallbackNews = async (sourceType = "cnn") => {
    const sourceUrls = {
        cnn: "https://saurav.tech/NewsAPI/everything/cnn.json",
        bbc: "https://saurav.tech/NewsAPI/everything/bbc-news.json",
        verge: "https://saurav.tech/NewsAPI/everything/the-verge.json"
    };

    const targetUrl = sourceUrls[sourceType] || sourceUrls.cnn;
    try {
        const { data } = await axios.get(targetUrl, { timeout: 10000 });
        const articles = data?.articles || [];
        if (articles.length === 0) return null;

        let response = `📰 *NEWS HEADLINES (${sourceType.toUpperCase()})*\n━━━━━━━━━━━━━━━━━━━\n\n`;
        articles.slice(0, 6).forEach((news, i) => {
            response += `*#${i + 1}:* ${news.title}\n`;
            if (news.url) response += `🔗 ${news.url}\n`;
            response += `\n`;
        });
        response += `━━━━━━━━━━━━━━━━━━━\n_Source: NewsAPI Backup_`;
        return response;
    } catch (e) {
        return null;
    }
};

module.exports = {
    name: "news",
    aliases: ["headlines", "technews", "bbcnews", "citizennews", "cnn"],
    description: "Get latest news headlines from BBC, NTV, Citizen, KBC, Tech, or search Kenya news (with fallback API).",
    category: "general",
    async execute({ sock, jid, msg, args }) {
        const input = args.join(" ").trim();
        const source = args[0]?.toLowerCase();

        try {
            if (source === "bbc") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/bbc`, { timeout: 10000 });
                    const stories = res.data?.result?.topStories || [];
                    if (stories.length > 0) {
                        let response = `📰 *BBC NEWS HEADLINES*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        stories.slice(0, 7).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title}\n`;
                            if (item.description) response += `📝 ${item.description.slice(0, 120)}...\n`;
                            if (item.url) response += `🔗 ${item.url}\n`;
                            response += `\n`;
                        });
                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith BBC API error, trying fallback...");
                }

                // Fallback to previous API
                const fallbackText = await getFallbackNews("bbc");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ No BBC news articles found." }, { quoted: msg });

            } else if (source === "ntv") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/ntv`, { timeout: 10000 });
                    const articles = res.data?.result?.articles || [];
                    if (articles.length > 0) {
                        let response = `📰 *NTV KENYA NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        articles.slice(0, 7).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title}\n`;
                            if (item.summary) response += `📝 ${item.summary.slice(0, 120)}...\n`;
                            if (item.link) response += `🔗 ${item.link}\n`;
                            response += `\n`;
                        });
                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith NTV API error, trying fallback...");
                }

                const fallbackText = await getFallbackNews("cnn");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ No NTV news articles found." }, { quoted: msg });

            } else if (source === "kbc") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/kbc`, { timeout: 10000 });
                    const items = res.data?.result?.breakingNews || res.data?.result?.featuredArticles || [];
                    if (items.length > 0) {
                        let response = `📰 *KBC TV NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        items.slice(0, 7).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title}\n`;
                            if (item.url) response += `🔗 ${item.url}\n`;
                            response += `\n`;
                        });
                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith KBC API error, trying fallback...");
                }

                const fallbackText = await getFallbackNews("cnn");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ No KBC news articles found." }, { quoted: msg });

            } else if (source === "citizen") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/citizen`, { timeout: 10000 });
                    const stories = res.data?.result?.topStories || res.data?.result?.pinnedStories || [];
                    if (stories.length > 0) {
                        let response = `📰 *CITIZEN DIGITAL NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        stories.slice(0, 7).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title || item.name}\n`;
                            if (item.url) response += `🔗 ${item.url}\n`;
                            response += `\n`;
                        });
                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith Citizen API error, trying fallback...");
                }

                const fallbackText = await getFallbackNews("cnn");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ No Citizen news articles found." }, { quoted: msg });

            } else if (source === "tech" || source === "verge") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/tech`, { timeout: 10000 });
                    const articles = res.data?.result?.featuredArticles || res.data?.result?.articles || [];
                    if (articles.length > 0) {
                        let response = `💻 *LATEST TECH NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        articles.slice(0, 7).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title}\n`;
                            if (item.description) response += `📝 ${item.description.slice(0, 120)}...\n`;
                            if (item.link || item.url) response += `🔗 ${item.link || item.url}\n`;
                            response += `\n`;
                        });
                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith Tech API error, trying fallback...");
                }

                const fallbackText = await getFallbackNews("verge");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ No tech news articles found." }, { quoted: msg });

            } else if (source === "cnn") {
                const fallbackText = await getFallbackNews("cnn");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ No CNN news articles found." }, { quoted: msg });

            } else if (source === "kenyans" || (input && !["bbc", "ntv", "kbc", "citizen", "tech", "cnn", "verge"].includes(source))) {
                const searchQuery = source === "kenyans" ? (args.slice(1).join(" ") || "Kenya") : input;
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/kenyans/search?q=${encodeURIComponent(searchQuery)}`, { timeout: 10000 });
                    const results = res.data?.result?.results || [];

                    if (results.length > 0) {
                        let response = `📰 *NEWS SEARCH: "${searchQuery.toUpperCase()}"*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        results.slice(0, 7).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title}\n`;
                            if (item.url) response += `🔗 ${item.url}\n`;
                            response += `\n`;
                        });
                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith Kenyans Search API error, trying fallback...");
                }

                // Fallback to CNN/BBC if search fails
                const fallbackText = await getFallbackNews("cnn");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: `❌ No news results found for *"${searchQuery}"*.` }, { quoted: msg });

            } else {
                // Default: Try Keith BBC first
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/bbc`, { timeout: 10000 });
                    const stories = res.data?.result?.topStories || [];

                    if (stories.length > 0) {
                        let response = `📰 *TOP GLOBAL NEWS (BBC)*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        stories.slice(0, 6).forEach((item, i) => {
                            response += `*#${i + 1}:* ${item.title}\n`;
                            if (item.url) response += `🔗 ${item.url}\n\n`;
                        });
                        response += `━━━━━━━━━━━━━━━━━━━\n`;
                        response += `💡 *Usage:* \`.news <bbc|ntv|citizen|kbc|tech|cnn|verge|query>\`\n`;
                        response += `_Example: \`.news tech\` or \`.news Ruto\`_`;

                        return await sock.sendMessage(jid, { text: response }, { quoted: msg });
                    }
                } catch (e) {
                    console.warn("Keith Default BBC API error, trying fallback...");
                }

                // Fallback to previous API (CNN)
                const fallbackText = await getFallbackNews("cnn");
                if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
                return await sock.sendMessage(jid, { text: "❌ Error fetching news headlines." }, { quoted: msg });
            }
        } catch (err) {
            console.error("News command global error:", err.message);
            const fallbackText = await getFallbackNews("cnn");
            if (fallbackText) return await sock.sendMessage(jid, { text: fallbackText }, { quoted: msg });
            await sock.sendMessage(jid, { text: "❌ Error fetching news headlines from API." }, { quoted: msg });
        }
    }
};
