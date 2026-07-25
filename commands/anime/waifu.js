module.exports = {
    name: "waifu",
    description: "Get a random anime waifu image.",
    category: "anime",
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "💞 Finding a waifu for you..." });

            const imageUrl = "https://shizoapi.onrender.com/api/sfw/waifu?apikey=shizo";
            
            await sock.sendMessage(jid, {
                image: { url: imageUrl },
                caption: `💞 *RANDOM WAIFU*\n\n_Your daily dose of anime charm!_\n_Nexus-1MD Anime Hub_`
            }, { quoted: msg });

        } catch (error) {
            console.error("Waifu command error:", error);
            await sock.sendMessage(jid, { text: "❌ Could not fetch a waifu at the moment. Please try again later." });
        }
    }
};
