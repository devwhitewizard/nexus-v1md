const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "tomp3",
    description: "Convert audio to high-quality MP3.",
    category: "sticker",
    async execute({ sock, jid, msg }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const mime = quoted?.audioMessage?.mimetype || "";

        if (!/audio/.test(mime)) {
            return await sock.sendMessage(jid, { text: "⚠️ Reply to an audio message to convert to MP3!" });
        }

        await sock.sendMessage(jid, { text: "⏳ Transcoding to MP3..." });

        try {
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            const inputPath = path.join(__dirname, `../tmp/input_${Date.now()}.opus`);
            const outputPath = path.join(__dirname, `../tmp/output_${Date.now()}.mp3`);
            
            fs.writeFileSync(inputPath, buffer);

            // High-quality 192kbps MP3 CBR
            exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 192k ${outputPath}`, { timeout: 15000 }, async (err) => {
                if (err) {
                    console.error("FFmpeg mp3 error:", err);
                    await sock.sendMessage(jid, { text: "❌ MP3 transcoding failed." });
                } else {
                    await sock.sendMessage(jid, { 
                        document: fs.readFileSync(outputPath),
                        mimetype: "audio/mpeg",
                        fileName: "NexusConverted.mp3"
                    }, { quoted: msg });
                }

                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error("tomp3 error:", error);
            await sock.sendMessage(jid, { text: "❌ Error during MP3 conversion." });
        }
    }
};
