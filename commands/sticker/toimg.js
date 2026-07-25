const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "toimg",
    aliases: ["toimage", "toview"],
    description: "Convert sticker to image.",
    category: "sticker",
    async execute({ sock, jid, msg }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.stickerMessage) {
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

            const inputPath = path.join(__dirname, `../tmp/input_${Date.now()}.webp`);
            const outputPath = path.join(__dirname, `../tmp/output_${Date.now()}.png`);
            
            fs.writeFileSync(inputPath, buffer);

            // Using ffmpeg to convert webp to png
            exec(`ffmpeg -i ${inputPath} ${outputPath}`, { timeout: 15000 }, async (err) => {
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
