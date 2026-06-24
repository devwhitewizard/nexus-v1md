const axios = require("axios");

module.exports = {
    name: "shorten",
    aliases: ["tinyurl", "cleanuri", "rebrandly", "vurl", "ssur", "tinube"],
    description: "Shorten a long URL",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, text, msg } = ctx;
        const url = args[0];

        if (!url) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.shorten <long_url>`" }, { quoted: msg });
        }

        // Simple validation
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return await sock.sendMessage(jid, { text: "⚠️ Please enter a valid URL starting with http:// or https://" }, { quoted: msg });
        }

        // Determine which service to use based on command trigger
        const trigger = text.split(/\s+/)[0].slice(1).toLowerCase();

        try {
            await sock.sendMessage(jid, { text: "⏳ Shortening URL..." }, { quoted: msg });
            let shortUrl = "";

            if (trigger === "cleanuri") {
                const res = await axios.post("https://cleanuri.com/api/v1/shorten", { url });
                shortUrl = res.data?.result_url;
            } else if (trigger === "tinyurl") {
                const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
                shortUrl = res.data;
            } else {
                // Default fallback to is.gd which is fast and reliable
                const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
                shortUrl = res.data;
            }

            if (!shortUrl) {
                throw new Error("Empty response from shortening service");
            }

            let reply = `🔗 *URL SHORTENED*\n\n`;
            reply += `▸ *Original:* ${url}\n`;
            reply += `▸ *Shortened:* ${shortUrl}`;

            await sock.sendMessage(jid, { text: reply }, { quoted: msg });
        } catch (error) {
            console.error("❌ URL Shortening Error:", error);
            // Try fallback
            try {
                const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
                const fallbackUrl = res.data;
                if (fallbackUrl) {
                    let reply = `🔗 *URL SHORTENED (Fallback)*\n\n`;
                    reply += `▸ *Original:* ${url}\n`;
                    reply += `▸ *Shortened:* ${fallbackUrl}`;
                    return await sock.sendMessage(jid, { text: reply }, { quoted: msg });
                }
            } catch (fallbackErr) {
                // silent
            }
            await sock.sendMessage(jid, { text: `❌ Failed to shorten URL: ${error.message}` }, { quoted: msg });
        }
    }
};
