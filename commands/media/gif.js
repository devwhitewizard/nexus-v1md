const axios = require("axios");

module.exports = {
    name: "gif",
    aliases: ["giphy", "tenor"],
    description: "Search and send a GIF.",
    category: "media",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.gif <search query>`\n\nExample: `.gif funny cat`" });
        }

        try {
            await sock.sendMessage(jid, { text: `🔍 Searching for GIF: *${query}*...` });

            // Using popcat giphy endpoint (proxied for ease)
            const { data } = await axios.get(`https://api.popcat.xyz/giphy?q=${encodeURIComponent(query)}`);

            if (!data || !data.url) {
                return await sock.sendMessage(jid, { text: `❌ No GIFs found for: *${query}*` });
            }

            await sock.sendMessage(jid, {
                video: { url: data.url },
                gifPlayback: true,
                caption: `🎬 *GIF:* ${query}\n_Nexus-1MD Media Hub_`
            }, { quoted: msg });

        } catch (error) {
            console.error("Gif command error:", error);
            await sock.sendMessage(jid, { text: "❌ Oops! Something went wrong while fetching the GIF. Please try again later." });
        }
    }
};
