const axios = require("axios");

module.exports = {
    name: "define",
    aliases: ["dict", "meaning"],
    description: "Get the definition of a word.",
    category: "general",
    async execute({ sock, jid, args, msg }) {
        const word = args[0];
        if (!word) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.define <word>`" });

        try {
            const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            
            const entry = data[0];
            const definition = entry.meanings[0].definitions[0].definition;
            const pos = entry.meanings[0].partOfSpeech;

            const dictText = `📖 *DICTIONARY: ${word.toUpperCase()}*\n\n` +
                             `*Part of Speech:* ${pos}\n` +
                             `*Definition:* ${definition}\n\n` +
                             `_Expand your vocabulary with Nexus!_`;

            await sock.sendMessage(jid, { text: dictText }, { quoted: msg });
        } catch (err) {
            console.error("Define error:", err);
            await sock.sendMessage(jid, { text: "❌ Word not found or service unavailable." });
        }
    }
};
