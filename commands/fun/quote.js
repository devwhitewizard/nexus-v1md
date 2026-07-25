const axios = require("axios");

const LOCAL_QUOTES = [
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { content: "Success is not final, failure is not fatal — it is the courage to continue that counts.", author: "Winston Churchill" },
    { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { content: "Your time is limited. Don't waste it living someone else's life.", author: "Steve Jobs" },
    { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { content: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
];

module.exports = {
    name: "quote",
    aliases: ["quotes", "inspire", "motivation"],
    description: "Get an inspirational quote.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        let content = "", author = "";

        try {
            const { data } = await axios.get(
                "https://api.quotable.io/quotes/random?limit=1",
                { timeout: 8000 }
            );
            const q = Array.isArray(data) ? data[0] : data;
            content = q.content;
            author = q.author;
        } catch {
            const q = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
            content = q.content;
            author = q.author;
        }

        await sock.sendMessage(jid, {
            text:
                `✨ *DAILY INSPIRATION*\n\n` +
                `💬 _"${content}"_\n\n` +
                `— *${author}*\n\n` +
                `_Nexus-1MD Wisdom Engine_`
        }, { quoted: msg });
    }
};
