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

            const tempDir = path.join(__dirname, "../../temp_media");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const timestamp = Date.now();
            const inputPath = path.join(tempDir, `input_${timestamp}.mp4`);
            const outputPath = path.join(tempDir, `output_${timestamp}.mp3`);
            
            fs.writeFileSync(inputPath, buffer);

            const ffmpegCmd = `"${ffmpegPath}" -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 -y "${outputPath}"`;

            exec(ffmpegCmd, { timeout: 15000 }, async (err) => {
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
