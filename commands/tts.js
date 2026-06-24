const axios = require("axios");

module.exports = {
    name: "tts",
    aliases: ["texttospeech", "speech"],
    description: "Convert text to speech (audio voice note)",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;

        if (args.length === 0) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:* `.tts <text>` or `.tts <lang_code> <text>`\n\n*Examples:*\n▸ `.tts Hello World` (English default)\n▸ `.tts fr Bonjour` (French)\n▸ `.tts es Hola` (Spanish)" 
            }, { quoted: msg });
        }

        let lang = "en";
        // Check if first arg is a 2-letter language code
        if (args[0] && args[0].length === 2 && /^[a-zA-Z]+$/.test(args[0])) {
            lang = args.shift().toLowerCase();
        }

        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(jid, { text: "⚠️ Please provide some text to convert to speech." }, { quoted: msg });
        }

        if (text.length > 200) {
            return await sock.sendMessage(jid, { text: "⚠️ Text must be under 200 characters." }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { text: "⏳ Generating audio note..." }, { quoted: msg });
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
            
            const response = await axios.get(url, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data, "binary");

            await sock.sendMessage(jid, { 
                audio: buffer, 
                mimetype: "audio/mp4", 
                ptt: true 
            }, { quoted: msg });
        } catch (error) {
            console.error("❌ TTS Error:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to generate text to speech." }, { quoted: msg });
        }
    }
};
