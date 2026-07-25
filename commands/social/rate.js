const RATE_LABELS = [
    [95, "🏆 LEGENDARY — one of a kind!"],
    [85, "⭐ EXCELLENT — truly impressive!"],
    [75, "😎 GREAT — above average for sure!"],
    [60, "👍 DECENT — pretty solid!"],
    [45, "😐 AVERAGE — could be worse!"],
    [30, "😕 BELOW AVERAGE — needs work..."],
    [15, "💀 TERRIBLE — yikes..."],
    [0,  "🗑️ TRASH TIER — no comment."],
];

function getLabel(score) {
    return (RATE_LABELS.find(([t]) => score >= t) || RATE_LABELS.at(-1))[1];
}

module.exports = {
    name: "rate",
    aliases: ["rateme", "rateuser"],
    description: "Gives a random rating to a mentioned user.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, {
                text: "❓ *Usage:* `.rate @user`"
            });
        }

        const score = Math.floor(Math.random() * 101);
        const label = getLabel(score);
        const bar = "🟩".repeat(Math.round(score / 10)) + "⬜".repeat(10 - Math.round(score / 10));

        await sock.sendMessage(jid, {
            text:
                `⭐ *NEXUS RATER*\n\n` +
                `👤 @${mentioned.split("@")[0]}\n\n` +
                `${bar}\n` +
                `📊 *Score:* ${score}/100\n` +
                `${label}\n\n` +
                `_Rated by Nexus-1MD_`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
