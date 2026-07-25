const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "toaudio",
    aliases: ["tovn"],
    description: "Convert video to audio.",
    category: "sticker",
    async execute({ sock, jid, msg }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const mime = quoted?.videoMessage?.mimetype || "";

        if (!/video/.test(mime)) {
            return await sock.sendMessage(jid, { text: "⚠️ Reply to a video to extract audio!" });
        }

        await sock.sendMessage(jid, { text: "⏳ Extracting audio..." });

        try {
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            const inputPath = path.join(__dirname, `../tmp/input_${Date.now()}.mp4`);
            const outputPath = path.join(__dirname, `../tmp/output_${Date.now()}.mp3`);
            
            fs.writeFileSync(inputPath, buffer);

            exec(`ffmpeg -i ${inputPath} -vn -acodec libmp3lame -q:a 2 ${outputPath}`, { timeout: 15000 }, async (err) => {
                if (err) {
                    console.error("FFmpeg audio error:", err);
                    await sock.sendMessage(jid, { text: "❌ Audio extraction failed." });
                } else {
                    await sock.sendMessage(jid, { 
                        audio: fs.readFileSync(outputPath),
                        mimetype: "audio/mpeg",
                        ptt: true // Delivers as voice note
                    }, { quoted: msg });
                }

                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error("toaudio error:", error);
            await sock.sendMessage(jid, { text: "❌ Error during audio extraction." });
        }
    }
};
