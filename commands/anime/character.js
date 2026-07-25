const axios = require("axios");

module.exports = {
    name: "character",
    aliases: ["charinfo", "char"],
    description: "Get information about an anime character.",
    category: "anime",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.character <name>`\n\nExample: `.character Monkey D. Luffy`" });
        }

        try {
            await sock.sendMessage(jid, { text: `🔍 Searching for character: *${query}*...` });

            const { data } = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`);
            
            if (!data.data || data.data.length === 0) {
                return await sock.sendMessage(jid, { text: `❌ No results found for character: *${query}*` });
            }

            const char = data.data[0];
            const name = char.name;
            const name_kanji = char.name_kanji || "N/A";
            const about = char.about ? (char.about.substring(0, 500) + "...") : "No description available.";
            const url = char.url;

            const caption = 
                `👤 *CHARACTER INFORMATION*\n\n` +
                `🏷️ *Name:* ${name}\n` +
                `🉐 *Kanji:* ${name_kanji}\n\n` +
                `📝 *About:* ${about.replace(/\r?\n/g, " ")}\n\n` +
                `🔗 *MAL URL:* ${url}\n\n` +
                `_Nexus-1MD Anime Hub_`;

            if (char.images?.jpg?.image_url) {
                await sock.sendMessage(jid, {
                    image: { url: char.images.jpg.image_url },
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
            }

        } catch (error) {
            console.error("Character command error:", error);
            await sock.sendMessage(jid, { text: "❌ Oops! Something went wrong while fetching character details. Please try again later." });
        }
    }
};
