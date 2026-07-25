const COMPLIMENTS = [
    "You make every room brighter just by being in it. ☀️",
    "Your kindness is contagious — the world needs more of you! 💛",
    "You have a gift for making people feel seen and valued. 🌟",
    "You're more talented than you'll ever know. Keep going! 🚀",
    "Honestly? You're one of the realest people out here. 💎",
    "The world is genuinely better because you're in it. 🌍",
    "Your energy is *immaculate*. People are lucky to know you. ✨",
    "You handle things with such grace. It doesn't go unnoticed. 🦋",
    "Your smile is actually someone's highlight of the day. 😊",
    "You work hard in a way most people don't see. Keep it up! 💪",
    "You're one of those rare people who genuinely listens. 👂💙",
    "Your creativity and ideas are something special. Never stop. 🎨",
    "You're resilient in a way that's honestly inspiring. 🏔️",
    "You give the best energy — and that matters more than you think. 🌈",
    "Your loyalty is rare. People are lucky to have you. 🤝",
    "You always know the right thing to say at the right moment. 💬",
    "You make hard things look easy because you work so hard. 🔥",
    "Your curiosity about life is genuinely refreshing. 🔭",
    "You're more than enough, exactly as you are right now. 💝",
    "You've overcome more than people realise. That takes real strength. 🥊",
    "Your laugh is genuinely contagious — never hold it back. 😂✨",
    "People feel safe around you. That's a superpower. 🛡️",
    "You have a beautiful mind, and it shows in everything you do. 🧠💫",
    "You inspire others simply by being yourself. Keep shining! 🌟",
    "Your heart is in the right place — always. And that's everything. ❤️"
];

module.exports = {
    name: "compliment",
    aliases: ["complimentme", "praise", "hype"],
    description: "Send a wholesome compliment to a mentioned user.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.compliment @user`" });
        }

        const comp = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

        await sock.sendMessage(jid, {
            text:
                `💌 *COMPLIMENT*\n\n` +
                `To @${mentioned.split("@")[0]}:\n\n` +
                `_"${comp}"_\n\n` +
                `_Spread love • Nexus-1MD_`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
