const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "viewonce",
    aliases: ["vv"],
    description: "Reveal a view-once image or video (Reply to the message)",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, msg: message } = ctx;

        try {
            console.log("🔍 ViewOnce Debug: Processing command...");
            // Extract quoted imageMessage or videoMessage
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) {
                return await sock.sendMessage(jid, { text: "❌ Please reply to a view-once message." }, { quoted: message });
            }

            console.log("📦 Quoted Content:", JSON.stringify(quoted).slice(0, 200));

            // Support different nesting levels for ViewOnce
            const imageMsg = quoted.imageMessage || 
                             quoted.viewOnceMessage?.message?.imageMessage || 
                             quoted.viewOnceMessageV2?.message?.imageMessage;

            const videoMsg = quoted.videoMessage || 
                             quoted.viewOnceMessage?.message?.videoMessage || 
                             quoted.viewOnceMessageV2?.message?.videoMessage;

            if (imageMsg) {
                console.log("📸 Found Image Message");
                const stream = await downloadContentFromMessage(imageMsg, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await sock.sendMessage(jid, { image: buffer, caption: imageMsg.caption || '' }, { quoted: message });
            } else if (videoMsg) {
                console.log("🎥 Found Video Message");
                const stream = await downloadContentFromMessage(videoMsg, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await sock.sendMessage(jid, { video: buffer, caption: videoMsg.caption || '' }, { quoted: message });
            } else {
                await sock.sendMessage(jid, { text: '❌ Please reply to a view-once image or video.' }, { quoted: message });
            }
        } catch (err) {
            console.error("❌ ViewOnce Error:", err);
            await sock.sendMessage(jid, { text: `⚠️ Error: ${err.message}` }, { quoted: message });
        }
    }
};