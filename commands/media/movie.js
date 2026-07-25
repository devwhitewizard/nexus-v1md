const axios = require("axios");

module.exports = {
    name: "movie",
    aliases: ["movinfo", "film"],
    description: "Get information about a movie.",
    category: "media",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.movie <movie name>`\n\nExample: `.movie Inception`" });
        }

        try {
            await sock.sendMessage(jid, { text: `🎬 Searching for movie: *${query}*...` });

            // Using popcat API for movie info
            const { data } = await axios.get(`https://api.popcat.xyz/movie?q=${encodeURIComponent(query)}`);

            if (!data || data.error) {
                return await sock.sendMessage(jid, { text: `❌ No results found for movie: *${query}*` });
            }

            const caption = 
                `🎬 *MOVIE INFORMATION*\n\n` +
                `🎥 *Title:* ${data.title}\n` +
                `📅 *Released:* ${data.released}\n` +
                `⭐ *Rating:* ${data.rating}\n` +
                `⏳ *Runtime:* ${data.runtime}\n` +
                `🎭 *Genres:* ${data.genres}\n` +
                `🎬 *Director:* ${data.director}\n` +
                `👥 *Actors:* ${data.actors}\n\n` +
                `📝 *Plot:* ${data.plot}\n\n` +
                `_Nexus-1MD Media Hub_`;

            if (data.poster) {
                await sock.sendMessage(jid, {
                    image: { url: data.poster },
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
            }

        } catch (error) {
            console.error("Movie command error:", error);
            await sock.sendMessage(jid, { text: "❌ Oops! Something went wrong while fetching movie details. Please try again later." });
        }
    }
};
