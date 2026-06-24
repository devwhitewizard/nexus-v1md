const FormData = require("form-data");
const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "ocr",
    aliases: ["readtext"],
    description: "Extract text from the replied image using OCR",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage || msg.message;
        
        const imageMsg = quoted?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage || quoted?.viewOnceMessage?.message?.imageMessage;
        const mime = imageMsg?.mimetype || "";

        if (!/image/.test(mime)) {
            return await sock.sendMessage(jid, { text: "⚠️ Please reply to an image to extract text." }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { text: "⏳ Processing image OCR (this might take a few seconds)..." }, { quoted: msg });
            
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            // Create form data
            const form = new FormData();
            form.append("file", buffer, { filename: "ocr.jpg" });
            form.append("apikey", "helloworld");
            form.append("language", "eng");

            const response = await axios.post("https://api.ocr.space/parse/image", form, {
                headers: form.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const parsedText = response.data?.ParsedResults?.[0]?.ParsedText;
            if (!parsedText) {
                const errorDetails = response.data?.ErrorMessage || response.data?.OCRExitCode || "Unknown error";
                return await sock.sendMessage(jid, { text: `❌ Could not extract text from the image.\n\n⚠️ *Details:* ${errorDetails}` }, { quoted: msg });
            }

            let reply = `🔍 *OCR IMAGE TEXT EXTRACTOR*\n\n`;
            reply += `${parsedText}`;

            await sock.sendMessage(jid, { text: reply }, { quoted: msg });
        } catch (error) {
            console.error("❌ OCR Command Error:", error);
            await sock.sendMessage(jid, { text: `❌ OCR API failed: ${error.message}` }, { quoted: msg });
        }
    }
};
