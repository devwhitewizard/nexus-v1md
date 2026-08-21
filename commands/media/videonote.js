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
    name: "videonote",
    aliases: ["ptv", "circlevid", "tovideonote"],
    description: "Convert a video message to a WhatsApp round Video Note (PTV).",
    category: "media",
    async execute({ sock, jid, msg }) {
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const quotedParticipant = contextInfo?.participant || contextInfo?.remoteJid || msg.key.remoteJid;
        const quotedKey = contextInfo?.stanzaId;

        const directVideoMsg = msg.message?.videoMessage;
        const hasVideoInReply = quotedMsg?.videoMessage;
        const hasDirectVideo = directVideoMsg;

        if (!hasVideoInReply && !hasDirectVideo) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ Reply to a *video* or send a video with `.ptv` to convert it into a round Video Note!" 
            }, { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: "🎥", key: msg.key } });
        await sock.sendMessage(jid, { text: "⏳ Converting video to Video Note..." }, { quoted: msg });

        try {
            let buffer;

            if (hasVideoInReply) {
                const reconstructed = {
                    key: {
                        remoteJid: jid,
                        id: quotedKey || "",
                        fromMe: false,
                        participant: quotedParticipant
                    },
                    message: quotedMsg
                };
                buffer = await downloadMediaMessage(reconstructed, "buffer", {}, { logger: console });
            } else {
                buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
            }

            if (!buffer || buffer.length === 0) {
                return await sock.sendMessage(jid, { text: "❌ Failed to download the video." }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, "../../temp_media");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const timestamp = Date.now();
            const inputPath = path.join(tempDir, `ptv_in_${timestamp}.mp4`);
            const outputPath = path.join(tempDir, `ptv_out_${timestamp}.mp4`);

            fs.writeFileSync(inputPath, buffer);

            // Scale & Crop to 480x480 square for Video Note
            const size = 480;
            const ffmpegCmd = `"${ffmpegPath}" -i "${inputPath}" -t 60 -vf "scale=${size}:${size}:force_original_aspect_ratio=increase,crop=${size}:${size}" -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -r 30 -c:a aac -b:a 96k -ar 44100 -movflags +faststart -y "${outputPath}"`;

            exec(ffmpegCmd, { timeout: 45000 }, async (err) => {
                if (!err && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                    const videoBuffer = fs.readFileSync(outputPath);
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        ptv: true,
                        mimetype: "video/mp4"
                    }, { quoted: msg });
                    await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
                } else {
                    console.error("PTV FFmpeg error:", err);
                    await sock.sendMessage(jid, { text: "❌ Failed to process video note format." }, { quoted: msg });
                }

                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        } catch (error) {
            console.error("videonote command error:", error);
            await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: msg });
        }
    }
};
