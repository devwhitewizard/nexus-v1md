module.exports = {
    name: "lovetest",
    aliases: ["love", "calculate"],
    description: "Calculate the love percentage between two users!",
    category: "fun",
    groupOnly: true,
    async execute({ sock, jid, msg, args }) {
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentions.length < 2) {
            return await sock.sendMessage(jid, { 
                text: "❓ *Usage:* `.lovetest @user1 @user2`" 
            }, { quoted: msg });
        }

        const user1 = mentions[0];
        const user2 = mentions[1];
        const percentage = Math.floor(Math.random() * 101);

        let icon = "❤️";
        let comment = "";

        if (percentage < 30) {
            icon = "💔";
            comment = "Maybe just stay friends? 😅";
        } else if (percentage < 70) {
            icon = "😍";
            comment = "There is definitely a spark! 🔥";
        } else {
            icon = "💘";
            comment = "Wow! You two are soulmates! ✨🚀";
        }

        const response = 
            `❤️ *LOVE TEST RESULTS* ❤️\n━━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 @${user1.split("@")[0]}\n` +
            `➕\n` +
            `👤 @${user2.split("@")[0]}\n\n` +
            `💓 *Result:* ${percentage}% ${icon}\n` +
            `💬 *Comment:* ${comment}\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `_Nexus-1MD Matchmaker_`;

        await sock.sendMessage(jid, { 
            text: response, 
            mentions: [user1, user2] 
        }, { quoted: msg });
    }
};
