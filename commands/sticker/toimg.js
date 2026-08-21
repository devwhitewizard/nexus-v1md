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
    name: "toimg",
    aliases: ["toimage", "toview"],
    description: "Convert sticker to image.",
    category: "sticker",
    async execute({ sock, jid, msg }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
        const stickerMsg = quoted?.stickerMessage;

        if (!stickerMsg) {
            return await sock.sendMessage(jid, { text: "⚠️ Reply to a sticker to convert it to an image!" });
        }

        await sock.sendMessage(jid, { text: "⏳ Converting sticker..." });

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
            const inputPath = path.join(tempDir, `input_${timestamp}.webp`);
            const outputPath = path.join(tempDir, `output_${timestamp}.png`);
            
            fs.writeFileSync(inputPath, buffer);

            const ffmpegCmd = `"${ffmpegPath}" -i "${inputPath}" -y "${outputPath}"`;

            exec(ffmpegCmd, { timeout: 15000 }, async (err) => {
                if (err) {
                    console.error("FFmpeg error:", err);
                    await sock.sendMessage(jid, { text: "❌ Conversion failed." });
                } else {
                    await sock.sendMessage(jid, { 
                        image: fs.readFileSync(outputPath),
                        caption: "📸 *Converted to Image*"
                    }, { quoted: msg });
                }

                // Cleanup
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error("toimg error:", error);
            await sock.sendMessage(jid, { text: "❌ Error during conversion." });
        }
    }
};
