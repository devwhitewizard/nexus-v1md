const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "twitter",
    aliases: ["tw", "xdl", "x"],
    description: "Download Twitter/X videos.",
    category: "download",
    cooldown: 15000,
    async execute({ sock, jid, args, msg }) {
        const url = args[0];
        if (!url || (!url.includes("twitter.com") && !url.includes("x.com") && !url.includes("t.co"))) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.twitter <link>`\n\n_Example: `.twitter https://x.com/user/status/...`_" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Processing Twitter/X video...*" });

        try {
            const video = await mediaApi.twitterDownload(url);

            if (!video) {
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch Twitter/X video. Ensure the tweet contains a public video." });
            }

            if (video.buffer) {
                await sock.sendPresenceUpdate('composing', jid);
                await sock.sendMessage(jid, {
                    video: video.buffer,
                    caption: `🐦 *Twitter/X Downloader*\n\n✨ *Author:* ${video.uploader ? '@' + video.uploader : 'Unknown'}\n📝 *Title:* ${video.title || 'Twitter Video'}\n\n_Nexus-1MD • Media Delivery_`
                }, { quoted: msg });
            } else if (video.url) {
                await sock.sendMessage(jid, {
                    text: `🐦 *Twitter/X Downloader*\n\n✨ *Author:* ${video.uploader ? '@' + video.uploader : 'Unknown'}\n⚠️ *Buffer download failed.*\n🔗 *Link:* ${video.url}`
                }, { quoted: msg });
            }

        } catch (err) {
            console.error("Twitter error:", err);
            await sock.sendMessage(jid, { text: "❌ Error connecting to Twitter/X downloader." });
        }
    }
};
