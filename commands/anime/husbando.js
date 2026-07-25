const axios = require("axios");

module.exports = {
    name: "husbando",
    description: "Get a random anime husbando image.",
    category: "anime",
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "👔 Finding a husbando for you..." });

            const { data } = await axios.get("https://nekos.best/api/v2/husbando");
            
            if (data.results && data.results[0]) {
                const husbando = data.results[0];
                await sock.sendMessage(jid, {
                    image: { url: husbando.url },
                    caption: `👔 *RANDOM HUSBANDO*\n\n*Name:* ${husbando.artist_name || "Unknown"}\n\n_Nexus-1MD Anime Hub_`
                }, { quoted: msg });
            } else {
                throw new Error("Invalid API response");
            }

        } catch (error) {
            console.error("Husbando command error:", error);
            await sock.sendMessage(jid, { text: "❌ Could not fetch a husbando at the moment. Please try again later." });
        }
    }
};
