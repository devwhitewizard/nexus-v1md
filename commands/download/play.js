const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "play",
    aliases: ["song", "music"],
    description: "Search and download music.",
    category: "download",
    cooldown: 15000,
    async execute({ sock, jid, args, msg }) {
        const query = args.join(" ");
        if (!query) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.play <song name>`" });

        await sock.sendPresenceUpdate('composing', jid);
        const waitMsg = await sock.sendMessage(jid, { text: `🎵 *Searching for:* ${query}...` });


        try {
            const results = await mediaApi.ytSearch(query);
            if (!results || results.length === 0) {
                return await sock.sendMessage(jid, { text: "❌ No results found. Try a different name." });
            }

            const video = results[0];
            
            // Inform user about the video found
            await sock.sendMessage(jid, { 
                image: { url: video.thumbnail }, 
                caption: `🎵 *Found:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n\n⏳ *Processing audio for delivery...*`
            }, { edit: waitMsg.key });


            const audio = await mediaApi.ytDownload(video.url);
            if (!audio) {
                return await sock.sendMessage(jid, { 
                    text: `❌ *Download service unavailable.*\n\n🔗 *Original Link:* ${video.url}\n\n_You can try downloading it manually using the link above._` 
                }, { quoted: msg });
            }


            if (audio.buffer) {
                await sock.sendPresenceUpdate('recording', jid);
                await sock.sendMessage(jid, { 
                    audio: audio.buffer,
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: msg });
            } else if (audio.url) {
                await sock.sendMessage(jid, { 
                    text: `⚠️ *Buffer download failed.*\n\n🔗 *Download Link:* ${audio.url}\n\n_You can download it manually using the link above._`
                }, { quoted: msg });
            }
            
            await sock.sendMessage(jid, { text: `✅ *Finished:* ${audio.title || video.title}` });

        } catch (err) {
            console.error("Play error:", err);
            await sock.sendMessage(jid, { text: "❌ Connection error while searching for music." });
        }
    }
};

