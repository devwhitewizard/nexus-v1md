const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const Jimp = require("jimp");
const jsQR = require("jsqr");

module.exports = {
    name: "readqr",
    aliases: ["scanqr", "qrscan", "decodeqr"],
    description: "Read/decode a QR code from a replied image.",
    category: "general",
    execute: async ({ sock, jid, msg }) => {
        // Get the quoted/replied message
        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
            msg.message;

        const mime =
            (quoted?.imageMessage)?.mimetype || "";

        if (!mime.startsWith("image/")) {
            return await sock.sendMessage(jid, {
                text:
                    "⚠️ *Reply to an image containing a QR code.*\n\n" +
                    "_Usage: Reply to a QR code image and type `.readqr`_"
            });
        }

        try {
            await sock.sendMessage(jid, { text: "🔍 Scanning QR code..." });

            // Download the image
            const buffer = await downloadMediaMessage(
                { message: quoted },
                "buffer",
                {},
                { logger: console }
            );

            // Read with Jimp
            const image = await Jimp.read(buffer);
            const { data, width, height } = image.bitmap;

            // jsqr expects a Uint8ClampedArray of RGBA pixels
            const pixels = new Uint8ClampedArray(data);
            const code = jsQR(pixels, width, height, {
                inversionAttempts: "dontInvert"
            });

            if (!code) {
                // Try inverting colors if first attempt fails
                const codeInv = jsQR(pixels, width, height, {
                    inversionAttempts: "onlyInvert"
                });

                if (!codeInv) {
                    return await sock.sendMessage(jid, {
                        text:
                            "❌ *No QR code detected.*\n\n" +
                            "_Make sure the image is clear and the QR code is fully visible._"
                    });
                }

                return await sock.sendMessage(jid, {
                    text:
                        `📷 *QR CODE DECODED*\n\n` +
                        `✅ *Content:*\n${codeInv.data}\n\n` +
                        `_Scanned by Nexus-1MD_`
                }, { quoted: msg });
            }

            await sock.sendMessage(jid, {
                text:
                    `📷 *QR CODE DECODED*\n\n` +
                    `✅ *Content:*\n${code.data}\n\n` +
                    `_Scanned by Nexus-1MD_`
            }, { quoted: msg });

        } catch (err) {
            console.error("ReadQR error:", err);
            await sock.sendMessage(jid, {
                text: "❌ Failed to read the QR code. Make sure you replied to a clear, valid QR code image."
            });
        }
    }
};
