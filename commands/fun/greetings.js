const morning = {
    name: "morning",
    aliases: ["goodmorning", "gm"],
    description: "Wish someone a good morning.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const quotes = [
            "Good morning! Make today amazing. ✨",
            "Rise and shine! The world is waiting for your magic. ☀️",
            "Morning starts with a healthy mindset. Have a great day! 🌿",
            "May your morning be as bright as your smile. 🌞"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(jid, { text: `☕ *GOOD MORNING!* \n\n${quote}` }, { quoted: msg });
    }
};

const afternoon = {
    name: "afternoon",
    aliases: ["goodafternoon"],
    description: "Wish someone a good afternoon.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const quotes = [
            "Good afternoon! Don't forget to take a break. ☕",
            "Hope your afternoon is as productive as your morning was! 🚀",
            "Keep pushing! The evening is almost here. ✨",
            "A nice breeze and a good afternoon. Enjoy! 🍃"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(jid, { text: `🌤️ *GOOD AFTERNOON!* \n\n${quote}` }, { quoted: msg });
    }
};

const evening = {
    name: "evening",
    aliases: ["goodevening", "night", "goodnight"],
    description: "Wish someone a good evening.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const quotes = [
            "Good evening! Time to wind down and relax. 🌙",
            "The stars are out, and so should your worries. Sleep well! ✨",
            "Hope you had a fulfilling day. Rest up! 💤",
            "Evening is the time for peace. Have a quiet one. 🕯️"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(jid, { text: `🌙 *GOOD EVENING!* \n\n${quote}` }, { quoted: msg });
    }
};

const greetings = {
    name: "greetings",
    description: "Select a greeting based on the time of day.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return await morning.execute({ sock, jid, msg });
        if (hour >= 12 && hour < 17) return await afternoon.execute({ sock, jid, msg });
        return await evening.execute({ sock, jid, msg });
    }
};

module.exports = { morning, afternoon, evening, greetings };
