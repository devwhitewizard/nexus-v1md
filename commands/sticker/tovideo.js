const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const cheerio = require("cheerio");

// Locate FFmpeg binary (uses ffmpeg-static if available, or system ffmpeg)
let ffmpegPath = "ffmpeg";
try {
    ffmpegPath = require("ffmpeg-static") || "ffmpeg";
} catch (e) {
    ffmpegPath = "ffmpeg";
}

/**
 * WebP to MP4 converter using Ezgif form scraper
 */
async function webp2mp4(buffer) {
    try {
        const form = new FormData();
        form.append("new-image", buffer, "image.webp");

        const res = await axios.post("https://ezgif.com/webp-to-mp4", form, {
            headers: form.getHeaders(),
            timeout: 25000
        });

        const $ = cheerio.load(res.data);
        const form2 = new FormData();
        const obj = {};

        $("form input[name]").each((_, el) => {
            const name = $(el).attr("name");
            const val = $(el).val();
            obj[name] = val;
            form2.append(name, val);
        });

        if (!obj.file) return null;

        const res2 = await axios.post("https://ezgif.com/webp-to-mp4/" + obj.file, form2, {
            headers: form2.getHeaders(),
            timeout: 25000
        });

        const $2 = cheerio.load(res2.data);
        const src = $2("div#output > p.outfile > video > source").attr("src");
        if (!src) return null;
        
        const videoUrl = src.startsWith("http") ? src : "https:" + src;
        const videoBufRes = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 25000 });
        return Buffer.from(videoBufRes.data);
    } catch (err) {
        console.error("Ezgif webp2mp4 error:", err.message);
        return null;
    }
}

module.exports = {
    name: "tovideo",
    aliases: ["tomp4", "tov", "stickertovideo", "stickertovid", "sticker2vid"],
    description: "Convert a sticker or animated sticker to video (MP4).",
    category: "sticker",
    async execute({ sock, jid, msg }) {
        // Detect quoted sticker in reply context
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const quotedParticipant = contextInfo?.participant || contextInfo?.remoteJid || msg.key.remoteJid;
        const quotedKey = contextInfo?.stanzaId;

        // Also support direct sticker message
        const directStickerMsg = msg.message?.stickerMessage;

        const hasStickerInReply = quotedMsg?.stickerMessage;
        const hasDirectSticker = directStickerMsg;

        if (!hasStickerInReply && !hasDirectSticker) {
            return await sock.sendMessage(jid, { text: "⚠️ Reply to a sticker to convert it to a video!" }, { quoted: msg });
        }

        await sock.sendMessage(jid, { text: "⏳ Converting sticker to video..." }, { quoted: msg });

        try {
            let buffer;

            if (hasStickerInReply) {
                // Reconstruct a proper Baileys message object for downloadMediaMessage
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
                return await sock.sendMessage(jid, { text: "❌ Could not download the sticker. Please try again." }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, "../../temp_media");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const timestamp = Date.now();
            const inputPath = path.join(tempDir, `sticker_${timestamp}.webp`);
            const outputPath = path.join(tempDir, `video_${timestamp}.mp4`);

            fs.writeFileSync(inputPath, buffer);

            // 1. Attempt conversion using local/static FFmpeg binary
            const ffmpegCmd = `"${ffmpegPath}" -i "${inputPath}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -pix_fmt yuv420p -c:v libx264 -movflags +faststart -y "${outputPath}"`;

            exec(ffmpegCmd, { timeout: 30000 }, async (err) => {
                let sentSuccess = false;

                if (!err && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                    try {
                        const videoBuffer = fs.readFileSync(outputPath);
                        await sock.sendMessage(jid, {
                            video: videoBuffer,
                            caption: "🎥 *Converted to Video*",
                            mimetype: "video/mp4"
                        }, { quoted: msg });
                        sentSuccess = true;
                    } catch (sendErr) {
                        console.error("Local video send error:", sendErr.message);
                    }
                }

                // Cleanup temp files
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

                if (!sentSuccess) {
                    console.warn("FFmpeg conversion failed or sent error. Attempting Ezgif webp2mp4 scraper fallback...");
                    // 2. Online fallback via Ezgif form scraper
                    const onlineVideoBuffer = await webp2mp4(buffer);
                    if (onlineVideoBuffer && onlineVideoBuffer.length > 0) {
                        await sock.sendMessage(jid, {
                            video: onlineVideoBuffer,
                            caption: "🎥 *Converted to Video*",
                            mimetype: "video/mp4"
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(jid, { text: "❌ Failed to convert sticker to video. Please try again." }, { quoted: msg });
                    }
                }
            });

        } catch (error) {
            console.error("tovideo command error:", error);
            await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: msg });
        }
    }
};
