const axios = require("axios");

module.exports = {
    name: "shortlink",
    aliases: ["shorten", "short"],
    description: "Shorten a URL using TinyURL.",
    category: "general",
    execute: async ({ sock, jid, args, msg }) => {
        const url = args[0];
        if (!url) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.shortlink <url>`\n\n_Example: `.shortlink https://example.com`_" });
        }

        // Basic URL validation
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return await sock.sendMessage(jid, { text: "❌ Please provide a valid URL starting with `http://` or `https://`" });
        }

        try {
            await sock.sendMessage(jid, { text: "⏳ Shortening your link..." });

            const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);

            if (!data || !data.startsWith("http")) {
                throw new Error("Invalid response from TinyURL");
            }

            const reply =
                `🔗 *LINK SHORTENER*\n\n` +
                `📎 *Original:* ${url}\n` +
                `✂️ *Shortened:* ${data}\n\n` +
                `_Powered by TinyURL • Nexus-1MD_`;

            await sock.sendMessage(jid, { text: reply }, { quoted: msg });
        } catch (err) {
            console.error("Shortlink error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to shorten the link. Please try again later." });
        }
    }
};
