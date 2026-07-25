const axios = require("axios");

module.exports = {
    name: "quran",
    aliases: ["surah", "ayah"],
    description: "Lookup a Quran verse (Ayah) or search Quran by keywords.",
    category: "religion",
    async execute({ sock, jid, msg, args }) {
        if (args.length === 0) {
            return await sock.sendMessage(jid, {
                text: `🕌 *Quran Feature Help*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                     `*1. Ayah Lookup:* (Surah:Ayah)\n` +
                     `👉 \`.quran <surah>:<ayah>\`\n` +
                     `Example: \`.quran 2:255\` (Ayat Al-Kursi) or \`.quran 1:1\`\n\n` +
                     `*2. Keyword Search:*\n` +
                     `👉 \`.quran search <keyword>\`\n` +
                     `Example: \`.quran search patience\` or \`.quran search mercy\``
            }, { quoted: msg });
        }

        const isSearch = args[0].toLowerCase() === "search";

        if (isSearch) {
            const query = args.slice(1).join(" ").trim();
            if (!query) {
                return await sock.sendMessage(jid, { text: "❌ Please provide a keyword to search for. Example: \`.quran search mercy\`" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { text: `🔍 Searching Quran English translation for *"${query}"*...` }, { quoted: msg });
                
                const response = await axios.get(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/en`);
                const searchData = response.data.data;

                if (!searchData || !searchData.matches || searchData.matches.length === 0) {
                    return await sock.sendMessage(jid, { text: `❌ No verses found matching *"${query}"*.` }, { quoted: msg });
                }

                // Show top 7 results
                const matches = searchData.matches;
                const maxResults = Math.min(matches.length, 7);
                let responseText = `🕌 *Quran Search results for "${query}"* (${searchData.count} found):\n━━━━━━━━━━━━━━━━━━━\n\n`;

                for (let i = 0; i < maxResults; i++) {
                    const match = matches[i];
                    responseText += `📍 *Surah ${match.surah.englishName} (${match.surah.name}) ${match.surah.number}:${match.numberInSurah}*\n`;
                    responseText += `> ${match.text.trim()}\n\n`;
                }

                if (matches.length > maxResults) {
                    responseText += `_...and ${matches.length - maxResults} more matches._`;
                }

                return await sock.sendMessage(jid, { text: responseText }, { quoted: msg });
            } catch (err) {
                console.error("Quran Search Error:", err);
                return await sock.sendMessage(jid, { text: "❌ Failed to search Quran. Please try again later." }, { quoted: msg });
            }
        } else {
            // Ayah Lookup
            const lookupQuery = args.join(" ").trim();
            
            // Format check: surah:ayah (must have a colon)
            const parts = lookupQuery.split(":");
            if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
                return await sock.sendMessage(jid, { text: "❌ Invalid format. Please use \`surah:ayah\`, e.g. \`.quran 2:255\`" }, { quoted: msg });
            }

            try {
                const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${parts[0]}:${parts[1]}/editions/quran-simple,en.sahih`);
                const editions = response.data.data;

                if (!editions || editions.length < 2) {
                    return await sock.sendMessage(jid, { text: `❌ Could not find Ayah *"${lookupQuery}"*. Check surah & ayah numbers.` }, { quoted: msg });
                }

                const arabicText = editions[0].text;
                const englishText = editions[1].text;
                const surahInfo = editions[0].surah;

                const responseText = `🕌 *QURAN AYAH: ${surahInfo.englishName} (${surahInfo.name}) ${surahInfo.number}:${editions[0].numberInSurah}*\n` +
                                     `━━━━━━━━━━━━━━━━━━━\n\n` +
                                     `📖 *Arabic:*\n` +
                                     `*${arabicText}*\n\n` +
                                     `📝 *Translation (Sahih International):*\n` +
                                     `> _${englishText}_\n\n` +
                                     `*Surah info:* ${surahInfo.englishNameTranslation} (${surahInfo.revelationType})`;

                return await sock.sendMessage(jid, { text: responseText }, { quoted: msg });
            } catch (err) {
                console.error("Quran Lookup Error:", err.message);
                return await sock.sendMessage(jid, { text: `❌ Ayah *"${lookupQuery}"* not found. Check surah & ayah numbers (e.g., 2:255).` }, { quoted: msg });
            }
        }
    }
};
