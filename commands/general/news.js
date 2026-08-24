const axios = require("axios");

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse Google News RSS XML into an array of {title, link, pubDate, source} */
const parseGoogleRSS = (xml) => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const get = (tag) => {
            const m = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(block);
            return m ? (m[1] || m[2] || "").trim() : "";
        };
        const linkM = /<link>([\s\S]*?)<\/link>|<link\s*\/>/.exec(block);
        const link = linkM ? linkM[1]?.trim() || "" : "";
        const sourceM = /<source[^>]*>([^<]*)<\/source>/.exec(block);
        items.push({
            title: get("title"),
            link,
            pubDate: get("pubDate"),
            source: sourceM ? sourceM[1].trim() : ""
        });
    }
    return items;
};

/** Fetch Google News RSS for a search query */
const googleNewsSearch = async (query, hl = "en-US", gl = "US", ceid = "US:en") => {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
    const { data } = await axios.get(url, { timeout: 12000, headers: { "User-Agent": "Mozilla/5.0" } });
    return parseGoogleRSS(data);
};

/** Fetch Google News RSS for a named topic URL */
const googleNewsTopic = async (topicPath) => {
    const url = `https://news.google.com/rss/${topicPath}`;
    const { data } = await axios.get(url, { timeout: 12000, headers: { "User-Agent": "Mozilla/5.0" } });
    return parseGoogleRSS(data);
};

/** Format a list of RSS articles into a WhatsApp-ready string */
const formatArticles = (articles, header, limit = 7) => {
    let text = `${header}\n━━━━━━━━━━━━━━━━━━━\n\n`;
    articles.slice(0, limit).forEach((a, i) => {
        text += `*#${i + 1}:* ${a.title}`;
        if (a.source) text += `  _(${a.source})_`;
        text += `\n`;
        if (a.link) text += `🔗 ${a.link}\n`;
        text += `\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━`;
    return text;
};

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

// ─── Command ────────────────────────────────────────────────────────────────

module.exports = {
    name: "news",
    aliases: ["headlines", "technews", "bbcnews", "citizennews", "cnn"],
    hideAliases: true,
    description: "Search any news topic — e.g. .news Ruto or .news AI",
    category: "news",

    async execute({ sock, jid, msg, args, commandName }) {
        const input = args.join(" ").trim();
        const source = args[0]?.toLowerCase();

        const KNOWN_SOURCES = ["bbc", "ntv", "kbc", "citizen", "tech", "cnn", "verge", "kenyans"];

        try {
            // ── BBC ──────────────────────────────────────────────────────────
            if (source === "bbc" || commandName === "bbcnews") {
                let articles = [];
                // Try Keith API first
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
                articles = await googleNewsSearch("BBC News site:bbc.com OR site:bbc.co.uk");
                if (articles.length === 0) articles = await googleNewsTopic("headlines?hl=en-US&gl=US&ceid=US:en");
                if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No BBC news found." }, { quoted: msg });
                return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *BBC NEWS HEADLINES*") }, { quoted: msg });
            }

            // ── NTV ──────────────────────────────────────────────────────────
            if (source === "ntv") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/ntv`, { timeout: 10000 });
                    const articles = res.data?.result?.articles || [];
                    if (articles.length > 0) {
                        let text = `📰 *NTV KENYA NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        articles.slice(0, 7).forEach((item, i) => {
                            text += `*#${i + 1}:* ${item.title}\n`;
                            if (item.summary) text += `📝 ${item.summary.slice(0, 120)}...\n`;
                            if (item.link) text += `🔗 ${item.link}\n`;
                            text += `\n`;
                        });
                        text += `━━━━━━━━━━━━━━━━━━━`;
                        return await sock.sendMessage(jid, { text }, { quoted: msg });
                    }
                } catch (_) {}
                // Google RSS fallback
                const articles = await googleNewsSearch("NTV Kenya news site:ntvkenya.co.ke OR NTV Kenya");
                if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No NTV news found." }, { quoted: msg });
                return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *NTV KENYA NEWS*") }, { quoted: msg });
            }

            // ── KBC ──────────────────────────────────────────────────────────
            if (source === "kbc") {
                try {
                    const res = await axios.get(`${KEITH_API_BASE}/news/kbc`, { timeout: 10000 });
                    const items = res.data?.result?.breakingNews || res.data?.result?.featuredArticles || [];
                    if (items.length > 0) {
                        let text = `📰 *KBC TV NEWS*\n━━━━━━━━━━━━━━━━━━━\n\n`;
                        items.slice(0, 7).forEach((item, i) => {
                            text += `*#${i + 1}:* ${item.title}\n`;
                            if (item.url) text += `🔗 ${item.url}\n`;
                            text += `\n`;
                        });
                        text += `━━━━━━━━━━━━━━━━━━━`;
                        return await sock.sendMessage(jid, { text }, { quoted: msg });
                    }
                } catch (_) {}
                const articles = await googleNewsSearch("KBC Kenya news site:kbc.co.ke OR KBC Channel 1");
                if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No KBC news found." }, { quoted: msg });
                return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *KBC TV NEWS*") }, { quoted: msg });
            }

            // ── CITIZEN ──────────────────────────────────────────────────────
            if (source === "citizen" || commandName === "citizennews") {
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
                if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No Citizen news found." }, { quoted: msg });
                return await sock.sendMessage(jid, { text: formatArticles(articles, "📰 *CITIZEN DIGITAL NEWS*") }, { quoted: msg });
            }

            // ── TECH / VERGE ─────────────────────────────────────────────────
            if (source === "tech" || source === "verge" || commandName === "technews") {
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
                // Google Tech RSS topic
                const articles = await googleNewsTopic("topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0YVdjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en");
                if (articles.length > 0) return await sock.sendMessage(jid, { text: formatArticles(articles, "💻 *LATEST TECH NEWS*") }, { quoted: msg });
                const fallback = await googleNewsSearch("latest technology news AI gadgets");
                if (fallback.length === 0) return await sock.sendMessage(jid, { text: "❌ No tech news found." }, { quoted: msg });
                return await sock.sendMessage(jid, { text: formatArticles(fallback, "💻 *LATEST TECH NEWS*") }, { quoted: msg });
            }

            // ── CNN ──────────────────────────────────────────────────────────
            if (source === "cnn" || commandName === "cnn") {
                const articles = await googleNewsSearch("CNN news site:cnn.com");
                if (articles.length === 0) return await sock.sendMessage(jid, { text: "❌ No CNN news found." }, { quoted: msg });
                return await sock.sendMessage(jid, { text: formatArticles(articles, "📺 *CNN NEWS*") }, { quoted: msg });
            }

            // ── TOPIC SEARCH (any unrecognized keyword) ───────────────────────
            if (input && !KNOWN_SOURCES.includes(source)) {
                const query = input; // full user input as the topic
                let articles = [];
                // Try Keith Kenyans search first
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

                // Google News RSS — the real powerhouse for topic search
                articles = await googleNewsSearch(query);
                if (articles.length === 0) {
                    return await sock.sendMessage(jid, { text: `❌ No news results found for *"${query}"*. Try a different keyword.` }, { quoted: msg });
                }
                return await sock.sendMessage(jid, {
                    text: formatArticles(articles, `🔍 *NEWS: "${query.toUpperCase()}"*`)
                }, { quoted: msg });
            }

            // ── DEFAULT (no args) — show topic guide ─────────────────────────
            {
                const text =
                    `📰 *NEWS SEARCH*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Use *.news <topic>* to search any news topic.\n\n` +
                    `*Examples:*\n` +
                    `  • \`.news Ruto\`\n` +
                    `  • \`.news AI\`\n` +
                    `  • \`.news Kenya floods\`\n\n` +
                    `*Dedicated commands:*\n` +
                    `  • \`.bbcnews\` — BBC headlines\n` +
                    `  • \`.citizennews\` — Citizen TV\n` +
                    `  • \`.technews\` — Tech news\n` +
                    `  • \`.cnn\` — CNN news\n` +
                    `  • \`.headlines\` — Top global\n` +
                    `━━━━━━━━━━━━━━━━━━━`;
                return await sock.sendMessage(jid, { text }, { quoted: msg });
            }

        } catch (err) {
            console.error("News command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error fetching news. Please try again." }, { quoted: msg });
        }
    }
};
