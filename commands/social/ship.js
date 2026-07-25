// Seeded pseudo-random for consistent ship scores between same two users
function seedRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function hash(str) {
    let h = 0;
    for (const c of str) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
    return Math.abs(h);
}

function getScore(a, b) {
    // Same pair always gives same result
    const combined = [a, b].sort().join("");
    const rand = seedRandom(hash(combined));
    rand(); rand(); // warm up
    return Math.floor(rand() * 101);
}

function getTier(score) {
    if (score >= 91) return { label: "SOULMATES 💞", emoji: "💞", bar: "🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥" };
    if (score >= 75) return { label: "PERFECT MATCH 💖", emoji: "💖", bar: "🟥🟥🟥🟥🟥🟥🟥🟥⬜⬜" };
    if (score >= 55) return { label: "GREAT CHEMISTRY ❤️", emoji: "❤️", bar: "🟥🟥🟥🟥🟥🟥⬜⬜⬜⬜" };
    if (score >= 35) return { label: "SOMETHING THERE 🤔", emoji: "🤔", bar: "🟥🟥🟥🟥⬜⬜⬜⬜⬜⬜" };
    if (score >= 15) return { label: "JUST FRIENDS 😬", emoji: "😬", bar: "🟥🟥⬜⬜⬜⬜⬜⬜⬜⬜" };
    return { label: "TOTAL DISASTER 😭", emoji: "😭", bar: "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜" };
}

module.exports = {
    name: "ship",
    aliases: ["shipme", "compat", "love"],
    description: "Check the compatibility between two users.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentions =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentions.length < 2) {
            return await sock.sendMessage(jid, {
                text: "❓ *Usage:* `.ship @user1 @user2`\n\n_Example: `.ship @Alice @Bob`_"
            });
        }

        const [a, b] = mentions;
        const score = getScore(a, b);
        const { label, emoji, bar } = getTier(score);

        await sock.sendMessage(jid, {
            text:
                `💘 *SHIP CALCULATOR*\n\n` +
                `👤 @${a.split("@")[0]}\n` +
                `        💕\n` +
                `👤 @${b.split("@")[0]}\n\n` +
                `${bar}\n` +
                `❤️ *Compatibility:* ${score}%\n` +
                `${emoji} *Status:* ${label}\n\n` +
                `_Nexus-1MD Love Detector_`,
            mentions: [a, b]
        }, { quoted: msg });
    }
};
