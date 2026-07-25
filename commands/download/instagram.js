const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "instagram",
    aliases: ["ig", "reels"],
    description: "Download Instagram media.",
    category: "download",
    cooldown: 15000,
    async execute({ sock, jid, args, msg }) {
        const url = args[0];
        if (!url || !url.includes("instagram.com")) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.ig <link>`" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Processing Instagram media...*" });

        try {
            const result = await mediaApi.igDownload(url);
            
            if (!result || result.length === 0) {
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch Instagram media. Is it a private account?" });
            }

            for (const item of result) {
                if (item.buffer) {
                    await sock.sendPresenceUpdate('composing', jid);
                    if (item.isVideo) {
                        await sock.sendMessage(jid, { video: item.buffer, caption: "📸 *Instagram Reel/Video*" }, { quoted: msg });
                    } else {
                        await sock.sendMessage(jid, { image: item.buffer, caption: "📸 *Instagram Image*" }, { quoted: msg });
                    }
                } else if (item.url) {
                    await sock.sendMessage(jid, { 
                        text: `📸 *Instagram Media*\n⚠️ *Buffer download failed.*\n🔗 *Link:* ${item.url}`
                    }, { quoted: msg });
                }
            }


        } catch (err) {
            console.error("Instagram error:", err);
            await sock.sendMessage(jid, { text: "❌ Error connecting to Instagram service." });
        }
    }
};

