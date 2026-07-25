const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "tiktok",
    aliases: ["tt"],
    description: "Download TikTok videos (no watermark).",
    category: "download",
    async execute({ sock, jid, args, msg }) {
        const url = args[0];
        if (!url || !url.includes("tiktok.com")) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.tiktok <link>`" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Processing TikTok...*" });

        try {
            const video = await mediaApi.tiktokDownload(url);
            
            if (!video) {
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch TikTok. Ensure the link is public." });
            }

            if (video.buffer) {
                await sock.sendPresenceUpdate('composing', jid);
                await sock.sendMessage(jid, { 
                    video: video.buffer,
                    caption: `🎬 *TikTok Downloader*\n\n✨ *Author:* ${video.author || "Unknown"}\n📦 *Format:* No Watermark\n\n_Nexus-1MD • Media Delivery_`
                }, { quoted: msg });
            } else if (video.url) {
                await sock.sendMessage(jid, { 
                    text: `🎬 *TikTok Downloader*\n\n✨ *Author:* ${video.author || "Unknown"}\n⚠️ *Buffer download failed.*\n🔗 *Link:* ${video.url}`
                }, { quoted: msg });
            }


        } catch (err) {
            console.error("TikTok error:", err);
            await sock.sendMessage(jid, { text: "❌ Error connecting to TikTok downloader." });
        }
    }
};

