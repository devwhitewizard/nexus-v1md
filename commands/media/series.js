const axios = require("axios");

module.exports = {
    name: "series",
    aliases: ["show", "tvshow", "tv"],
    description: "Get information about a TV series.",
    category: "media",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.series <series name>`\n\nExample: `.series Breaking Bad`" });
        }

        try {
            await sock.sendMessage(jid, { text: `📺 Searching for series: *${query}*...` });

            // Popcat also has a show endpoint
            const { data } = await axios.get(`https://api.popcat.xyz/show?q=${encodeURIComponent(query)}`);

            if (!data || data.error) {
                return await sock.sendMessage(jid, { text: `❌ No results found for series: *${query}*` });
            }

            const caption = 
                `📺 *SERIES INFORMATION*\n\n` +
                `🎥 *Title:* ${data.name}\n` +
                `📅 *Years:* ${data.years}\n` +
                `⭐ *Rating:* ${data.rating}\n` +
                `⏳ *Runtime:* ${data.runtime}\n` +
                `🎭 *Genres:* ${data.genres}\n` +
                `📡 *Network:* ${data.network}\n` +
                `🎞️ *Status:* ${data.status}\n\n` +
                `📝 *Synopsis:* ${data.synopsis}\n\n` +
                `_Nexus-1MD Media Hub_`;

            if (data.image) {
                await sock.sendMessage(jid, {
                    image: { url: data.image },
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
            }

        } catch (error) {
            console.error("Series command error:", error);
            await sock.sendMessage(jid, { text: "❌ Oops! Something went wrong while fetching series details. Please try again later." });
        }
    }
};
