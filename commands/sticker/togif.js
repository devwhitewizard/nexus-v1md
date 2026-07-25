const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "togif",
    description: "Convert video to GIF.",
    category: "sticker",
    async execute({ sock, jid, msg }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const mime = (quoted?.videoMessage || quoted?.stickerMessage)?.mimetype || "";

        if (!/video|webp/.test(mime)) {
            return await sock.sendMessage(jid, { text: "⚠️ Reply to a video or animated sticker to convert to GIF!" });
        }

        await sock.sendMessage(jid, { text: "⏳ Generating GIF..." });

        try {
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            const inputPath = path.join(__dirname, `../tmp/input_${Date.now()}.mp4`);
            const outputPath = path.join(__dirname, `../tmp/output_${Date.now()}.gif`);
            
            fs.writeFileSync(inputPath, buffer);

            // Professional FFmpeg GIF conversion settings
            exec(`ffmpeg -i ${inputPath} -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${outputPath}`, { timeout: 15000 }, async (err) => {
                if (err) {
                    console.error("FFmpeg GIF error:", err);
                    await sock.sendMessage(jid, { text: "❌ GIF creation failed." });
                } else {
                    await sock.sendMessage(jid, { 
                        video: fs.readFileSync(outputPath),
                        gifPlayback: true,
                        caption: "🎞️ *Converted to GIF*"
                    }, { quoted: msg });
                }

                // Cleanup
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error("togif error:", error);
            await sock.sendMessage(jid, { text: "❌ Error during GIF conversion." });
        }
    }
};
