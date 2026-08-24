const axios = require("axios");

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

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

module.exports = {
    KEITH_API_BASE,
    parseGoogleRSS,
    googleNewsSearch,
    googleNewsTopic,
    formatArticles
};
