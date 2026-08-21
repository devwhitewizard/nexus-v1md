const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

let ffmpegPath = "ffmpeg";
try {
    ffmpegPath = require("ffmpeg-static") || "ffmpeg";
} catch (e) {
    ffmpegPath = "ffmpeg";
}

module.exports = {
    name: "togif",
    description: "Convert video or animated sticker to GIF.",
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

            const tempDir = path.join(__dirname, "../../temp_media");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const timestamp = Date.now();
            const inputPath = path.join(tempDir, `input_${timestamp}.mp4`);
            const outputPath = path.join(tempDir, `output_${timestamp}.gif`);
            
            fs.writeFileSync(inputPath, buffer);

            const ffmpegCmd = `"${ffmpegPath}" -i "${inputPath}" -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${outputPath}"`;

            exec(ffmpegCmd, { timeout: 30000 }, async (err) => {
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
