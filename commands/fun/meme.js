const axios = require("axios");

module.exports = {
    name: "meme",
    aliases: ["memes", "randommeme"],
    description: "Get a random meme image from Reddit.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "😂 Fetching a fresh meme..." });

            // meme-api.com returns safe memes from popular subreddits
            const { data } = await axios.get("https://meme-api.com/gimme", { timeout: 15000 });

            if (!data?.url) throw new Error("No meme URL");

            // Download the image buffer
            const imgRes = await axios.get(data.url, { responseType: "arraybuffer", timeout: 20000 });
            const imgBuffer = Buffer.from(imgRes.data);

            await sock.sendMessage(jid, {
                image: imgBuffer,
                caption:
                    `😂 *RANDOM MEME*\n\n` +
                    `📌 *${data.title}*\n` +
                    `👍 ${data.ups.toLocaleString()} upvotes  •  r/${data.subreddit}\n\n` +
                    `_Nexus-1MD Meme Feed_`
            }, { quoted: msg });

        } catch (err) {
            console.error("Meme error:", err.message);
            await sock.sendMessage(jid, {
                text: "😢 Couldn't fetch a meme right now. Reddit might be slow. Try again!"
            });
        }
    }
};
