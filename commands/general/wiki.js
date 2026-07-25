const axios = require("axios");

module.exports = {
    name: "wiki",
    aliases: ["wikipedia"],
    description: "Get Wikipedia summary for a topic.",
    category: "general",
    async execute({ sock, jid, args, msg }) {
        const query = args.join(" ");
        if (!query) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.wiki <topic>`" });

        try {
            // Using a public Wikipedia API
            const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, "_"))}`);
            
            if (data.type === "disambiguation" || data.status === 404) {
               return await sock.sendMessage(jid, { text: "❌ Topic not found or too vague. Try being more specific." });
            }

            const wikiText = `📚 *WIKIPEDIA: ${data.title}*\n\n` +
                             `${data.extract}\n\n` +
                             `🔗 *Source:* ${data.content_urls.desktop.page}`;

            await sock.sendMessage(jid, { 
                text: wikiText,
                contextInfo: {
                    externalAdReply: {
                        title: data.title,
                        body: "Wikipedia Summary",
                        thumbnailUrl: data.thumbnail?.source || "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png",
                        mediaType: 1
                    }
                }
            }, { quoted: msg });
        } catch (err) {
            console.error("Wiki error:", err);
            await sock.sendMessage(jid, { text: "❌ Error fetching Wikipedia data." });
        }
    }
};
