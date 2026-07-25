const INSULTS = [
    "You're not completely useless — you can always serve as a bad example. 😂",
    "I'd agree with you, but then we'd both be wrong. 🤷",
    "You're like a software update — whenever I see you, I think 'not now'. 💻",
    "Somewhere out there, someone cares about this. Not me, but someone. 🌍",
    "I'd love to insult you more, but I'm afraid I'd be here all day. ⏰",
    "You have the emotional depth of a puddle. 💧",
    "I envy the people who haven't met you. 🙃",
    "You're like a cloud — when you disappear, it's a beautiful day. ☀️",
    "I'm not saying you're dumb, but you'd lose a debate with a wall. 🧱",
    "Your wifi password is probably 'password'. Don't deny it. 📶",
    "You take 'taking your time' to an entirely new dimension. ⏳",
    "You should come with a warning label. Just out of consideration. ⚠️",
    "You bring everyone so much joy when you leave the chat. 🚪",
    "I've seen better arguments in a kindergarten. 👶",
    "You're not stupid, you just have a lot of bad thoughts at full speed. 🚀",
    "If ignorance is bliss, you must be the happiest person alive. 😊",
    "You're the reason why I believe in natural selection. 🦕",
    "Your cooking is so bad, the flies pitched in to fix your screen door. 🪰",
    "You're like Monday — nobody's happy to see you. 😩",
    "I'd call you a genius, but that would make this the worst insult ever. 🧠"
];

module.exports = {
    name: "insult",
    aliases: ["mockme", "joke"],
    description: "Send a light-hearted joke insult to a mentioned user.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.insult @user`" });
        }

        const insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];

        await sock.sendMessage(jid, {
            text:
                `😂 *JOKE INSULT*\n\n` +
                `🎯 @${mentioned.split("@")[0]}:\n\n` +
                `_"${insult}"_\n\n` +
                `_All in good fun! • Nexus-1MD_`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
