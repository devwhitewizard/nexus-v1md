const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "yt",
    aliases: ["youtube", "video"],
    description: "Download YouTube videos.",
    category: "download",
    async execute({ sock, jid, args, msg }) {
        const url = args[0];
        if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.yt <link>`" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Processing your video...* Please wait." });

        try {
            const audio = await mediaApi.ytDownload(url);
            
            if (!audio) {
                return await sock.sendMessage(jid, { 
                    text: `❌ *Download service unavailable.*\n\n🔗 *Original Link:* ${url}\n\n_The bot could not process the download, but you can use the link above._` 
                }, { quoted: msg });
            }


            if (audio.buffer) {
                await sock.sendPresenceUpdate('recording', jid);
                await sock.sendMessage(jid, { 
                    audio: audio.buffer,
                    mimetype: "audio/mpeg",
                    fileName: `${audio.title || "audio"}.mp3`,
                    caption: `🎵 *YouTube Audio*\n\n✨ *Title:* ${audio.title || "Unknown"}\n📦 *Format:* MP3\n\n_Nexus-1MD • Media Delivery_`
                }, { quoted: msg });
            } else if (audio.url) {
                await sock.sendMessage(jid, { 
                    text: `🎵 *YouTube Audio*\n\n✨ *Title:* ${audio.title || "Unknown"}\n⚠️ *Buffer download failed.*\n🔗 *Link:* ${audio.url}`
                }, { quoted: msg });
            }


        } catch (err) {
            console.error("YouTube error:", err);
            await sock.sendMessage(jid, { text: "❌ Connection error while downloading video." });
        }
    }
};

