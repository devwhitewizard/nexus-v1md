const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "facebook",
    aliases: ["fb", "fbdl"],
    description: "Download Facebook videos.",
    category: "download",
    cooldown: 15000,
    async execute({ sock, jid, args, msg }) {
        const url = args[0];
        if (!url || !url.includes("facebook.com") && !url.includes("fb.watch")) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.fb <link>`" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Processing Facebook video...*" });

        try {
            const video = await mediaApi.facebookDownload(url);
            
            if (!video) {
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch Facebook video. Ensure it is public." });
            }

            if (video.buffer) {
                await sock.sendPresenceUpdate('composing', jid); // for video it's usually composing
                await sock.sendMessage(jid, { 
                    video: video.buffer,
                    caption: `🔵 *Facebook Video Downloader*\n\n✨ *Title:* ${video.title || "Unknown"}\n\n_Nexus-1MD • Media Delivery_`
                }, { quoted: msg });
            } else if (video.url) {
                await sock.sendMessage(jid, { 
                    text: `🔵 *Facebook Video Downloader*\n\n✨ *Title:* ${video.title || "Unknown"}\n⚠️ *Buffer download failed.*\n🔗 *Link:* ${video.url}`
                }, { quoted: msg });
            }


        } catch (err) {
            console.error("Facebook error:", err);
            await sock.sendMessage(jid, { text: "❌ Error connecting to Facebook service." });
        }
    }
};

