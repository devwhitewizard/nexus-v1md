const axios = require("axios");

module.exports = {
    name: "anime",
    aliases: ["randomanime"],
    description: "Get a random anime recommendation.",
    category: "anime",
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "🏮 Finding a random anime for you..." });

            const { data } = await axios.get("https://api.jikan.moe/v4/random/anime");
            const anime = data.data;

            const title = anime.title_english || anime.title;
            const score = anime.score || "N/A";
            const episodes = anime.episodes || "N/A";
            const type = anime.type || "N/A";
            const status = anime.status || "N/A";
            const genres = anime.genres.map(g => g.name).join(", ");
            const synopsis = anime.synopsis ? (anime.synopsis.substring(0, 400) + "...") : "No synopsis available.";
            const url = anime.url;

            const caption = 
                `🏮 *RANDOM ANIME SUGGESTION*\n\n` +
                `📺 *Title:* ${title}\n` +
                `🌟 *Score:* ${score}\n` +
                `🎬 *Type:* ${type}\n` +
                `🎞️ *Episodes:* ${episodes}\n` +
                `📅 *Status:* ${status}\n` +
                `🎭 *Genres:* ${genres}\n\n` +
                `📝 *Synopsis:* ${synopsis}\n\n` +
                `🔗 *MAL URL:* ${url}\n\n` +
                `_Nexus-1MD Anime Hub_`;

            if (anime.images?.jpg?.image_url) {
                await sock.sendMessage(jid, {
                    image: { url: anime.images.jpg.image_url },
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
            }

        } catch (error) {
            console.error("Anime command error:", error);
            await sock.sendMessage(jid, { text: "❌ Oops! Something went wrong while fetching anime details. Please try again later." });
        }
    }
};
