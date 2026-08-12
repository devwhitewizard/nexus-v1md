const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "linkedin",
    aliases: ["li", "lkdn"],
    description: "Download LinkedIn videos.",
    category: "download",
    cooldown: 15000,
    async execute({ sock, jid, args, msg }) {
        const url = args[0];
        if (!url || !url.includes("linkedin.com")) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.linkedin <link>`\n\n_Example: `.linkedin https://www.linkedin.com/posts/...`_" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Processing LinkedIn video...*" });

        try {
            const video = await mediaApi.linkedinDownload(url);

            if (!video) {
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch LinkedIn video. Ensure the post contains a public video." });
            }

            if (video.buffer) {
                await sock.sendPresenceUpdate('composing', jid);
                await sock.sendMessage(jid, {
                    video: video.buffer,
                    caption: `💼 *LinkedIn Downloader*\n\n✨ *Author:* ${video.uploader ? '@' + video.uploader : 'Unknown'}\n📝 *Title:* ${video.title || 'LinkedIn Video'}\n\n_Nexus-1MD • Media Delivery_`
                }, { quoted: msg });
            } else if (video.url) {
                await sock.sendMessage(jid, {
                    text: `💼 *LinkedIn Downloader*\n\n✨ *Author:* ${video.uploader ? '@' + video.uploader : 'Unknown'}\n⚠️ *Buffer download failed.*\n🔗 *Link:* ${video.url}`
                }, { quoted: msg });
            }

        } catch (err) {
            console.error("LinkedIn error:", err);
            await sock.sendMessage(jid, { text: "❌ Error connecting to LinkedIn downloader." });
        }
    }
};
