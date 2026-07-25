const RESPECT_TIERS = [
    [95, "🏅 LEGENDARY", "Absolute icon. The type of person you write songs about."],
    [80, "👑 HIGHLY RESPECTED", "Commands respect without even trying. Solid human being."],
    [65, "✅ WELL RESPECTED", "People trust them and listen when they speak."],
    [50, "👍 DECENT RESPECT", "A good person, earning their reputation step by step."],
    [35, "😐 SOMEWHAT RESPECTED", "Has potential. People are watching."],
    [20, "😬 LOW RESPECT", "They have some work to do in the streets..."],
    [0,  "💀 NO RESPECT", "Even their alarm clock doesn't take them seriously."]
];

module.exports = {
    name: "respect",
    aliases: ["respectme", "prestige"],
    description: "Check a user's respect rating in the group.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.respect @user`" });
        }

        const score = Math.floor(Math.random() * 101);
        const [, title, desc] = RESPECT_TIERS.find(([t]) => score >= t) || RESPECT_TIERS.at(-1);
        const bar = "🟨".repeat(Math.round(score / 10)) + "⬜".repeat(10 - Math.round(score / 10));

        await sock.sendMessage(jid, {
            text:
                `🫡 *RESPECT METER*\n\n` +
                `👤 @${mentioned.split("@")[0]}\n\n` +
                `${bar}\n` +
                `📊 *Respect:* ${score}%\n` +
                `🏷️ *Rank:* ${title}\n\n` +
                `💬 _"${desc}"_\n\n` +
                `_Nexus-1MD Social Index_`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
