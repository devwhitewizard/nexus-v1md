/**
 * Parses a raw Baileys message into a clean, flat context object.
 * @param {object} msg - Raw message from messages.upsert
 * @returns {{ jid, sender, text, isGroup, msg }}
 */
function parseMessage(msg) {
    const jid = msg.key.remoteJid;
    const isGroup = jid.endsWith("@g.us");

    // In groups the actual sender is key.participant; in DMs it's the jid itself
    const sender = (isGroup ? msg.key.participant : jid) || jid;

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

    return { jid, sender, text, isGroup, msg };
}

module.exports = { parseMessage };
