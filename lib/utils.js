/**
 * Centralized utility functions for Nexus-1MD
 */

/**
 * Converts a raw number string to a standard WhatsApp JID
 * @param {string} number - The raw number (e.g., "25479...")
 * @returns {string} - The formatted JID (e.g., "25479...@s.whatsapp.net")
 */
const toJid = (number) => {
    if (!number) return "";
    if (number.includes("@")) return number; // Already a JID
    
    // Remove leading 0 if present (common in Kenyan numbers)
    let clean = number.replace(/^0/, "254");
    
    return `${clean}@s.whatsapp.net`;
};

/**
 * Sends a message with native flow clickable CTA buttons (URLs) and optional media header
 * @param {object} sock - Baileys socket
 * @param {string} jid - Target JID
 * @param {string} text - Message body
 * @param {string} footerText - Message footer
 * @param {Array} buttons - Array of { text: string, url: string }
 * @param {object} media - Optional image buffer or URL object (e.g. { url: "..." } or Buffer)
 * @param {object} quoted - Quoted message object
 */
const sendButtonMessage = async (sock, jid, text, footerText, buttons = [], media = null, quoted = null) => {
    // Check if device is set to iPhone (which only supports plain text/media without interactive buttons)
    const { getSettings } = require("./settings");
    const settings = getSettings();
    const isIphone = settings.device && settings.device.toLowerCase() === "iphone";

    // Format fallback text first
    let fallbackText = `${text}\n\n`;
    buttons.forEach(btn => {
        fallbackText += `🔗 *${btn.text}:* ${btn.url}\n`;
    });
    if (footerText) fallbackText += `\n_${footerText}_`;

    if (isIphone) {
        if (media) {
            return await sock.sendMessage(jid, { image: media, caption: fallbackText }, { quoted });
        }
        return await sock.sendMessage(jid, { text: fallbackText }, { quoted });
    }

    try {
        const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@whiskeysockets/baileys");
        
        const nativeButtons = buttons.map(btn => ({
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: btn.text,
                url: btn.url,
                merchant_url: btn.url
            })
        }));

        let header = {};
        if (media) {
            try {
                const isObj = media && typeof media === "object" && !Buffer.isBuffer(media);
                const hasUrl = isObj && media.url;
                if (Buffer.isBuffer(media) || typeof media === "string" || hasUrl) {
                    const prepared = await prepareWAMessageMedia(
                        { image: Buffer.isBuffer(media) ? media : (hasUrl ? { url: media.url } : { url: media }) },
                        { upload: sock.waUploadToServer }
                    );
                    header = {
                        title: "",
                        hasMediaAttachment: true,
                        imageMessage: prepared.imageMessage
                    };
                }
            } catch (mediaErr) {
                console.warn("⚠️ Failed to prepare media header for button message, proceeding without image:", mediaErr.message);
            }
        }

        // Ensure the quoted message has actual content to prevent Baileys from crashing
        // when trying to normalize/parse an empty or unsupported quoted message
        const hasQuotedContent = quoted && quoted.key && quoted.message && Object.keys(quoted.message).length > 0;

        const msg = generateWAMessageFromContent(jid, {
            interactiveMessage: proto.Message.InteractiveMessage.create({
                header: Object.keys(header).length > 0 ? proto.Message.InteractiveMessage.Header.create(header) : undefined,
                body: proto.Message.InteractiveMessage.Body.create({ text }),
                footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: nativeButtons
                })
            })
        }, { 
            quoted: hasQuotedContent ? quoted : undefined,
            userJid: sock.user?.id || sock.authState?.creds?.me?.id || global.myJid
        });

        await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
        return msg;
    } catch (err) {
        console.error("❌ sendButtonMessage error, falling back to text:", err);
        const hasQuotedContent = quoted && quoted.key && quoted.message && Object.keys(quoted.message).length > 0;
        if (media) {
            return await sock.sendMessage(jid, { image: media, caption: fallbackText }, { quoted: hasQuotedContent ? quoted : undefined });
        }
        return await sock.sendMessage(jid, { text: fallbackText }, { quoted: hasQuotedContent ? quoted : undefined });
    }
};

module.exports = { toJid, sendButtonMessage };
