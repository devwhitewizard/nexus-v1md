const axios = require("axios");

module.exports = {
    name: "translate",
    aliases: ["tr"],
    description: "Translate text to English (default).",
    category: "general",
    async execute({ sock, jid, args, msg }) {
        let targetLang = "en";
        let textToTranslate = args.join(" ");

        // Check if first arg is a language code (2 letters)
        if (args[0] && args[0].length === 2) {
            targetLang = args[0].toLowerCase();
            textToTranslate = args.slice(1).join(" ");
        }

        if (!textToTranslate) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.translate <text>` or `.translate <lang> <text>`\n\nExample: `.translate sw Hello`" });

        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
            const { data } = await axios.get(url);
            
            if (!data || !data[0]) return await sock.sendMessage(jid, { text: "❌ Translation failed." });

            // Extract translated text from Google's complex array response
            const translation = data[0].map(item => item[0]).join("");

            const translationText = `🌍 *TRANSLATION*\n━━━━━━━━━━━━━━━━━━━\n` +
                                    `*Original:* ${textToTranslate}\n` +
                                    `*Result (${targetLang.toUpperCase()}):* ${translation}\n━━━━━━━━━━━━━━━━━━━`;

            await sock.sendMessage(jid, { text: translationText }, { quoted: msg });
        } catch (err) {
            console.error("Translate error:", err);
            await sock.sendMessage(jid, { text: "❌ Error connecting to translation service." });
        }
    }
};
