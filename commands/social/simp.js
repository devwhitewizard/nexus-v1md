const SIMP_TIERS = [
    [95, "🏆 ULTRA SIMP", "You have achieved the highest form of simp. There is no return."],
    [80, "😭 MEGA SIMP", "You would walk through fire. Barefoot. Just to wave at them."],
    [65, "🥺 CERTIFIED SIMP", "Everyone sees it. You're not hiding anything."],
    [50, "🤔 MODERATE SIMP", "You're 50% there. The other 50% is in denial."],
    [35, "😐 CASUAL SIMP", "You text back in under 3 seconds. You know what you are."],
    [20, "🙃 MILD SIMP", "You're fighting it, but the battle is lost."],
    [0,  "😎 NOT A SIMP", "Truly unbothered. Respect."]
];

function getTier(score) {
    return SIMP_TIERS.find(([t]) => score >= t) || SIMP_TIERS.at(-1);
}

module.exports = {
    name: "simp",
    aliases: ["simprate", "simpmeter"],
    description: "Check someone's simp level.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.simp @user`" });
        }

        const score = Math.floor(Math.random() * 101);
        const [, name, desc] = getTier(score);
        const bar = "🟦".repeat(Math.round(score / 10)) + "⬜".repeat(10 - Math.round(score / 10));

        await sock.sendMessage(jid, {
            text:
                `🥺 *SIMP METER*\n\n` +
                `👤 @${mentioned.split("@")[0]}\n\n` +
                `${bar}\n` +
                `📊 *Simp Level:* ${score}%\n` +
                `🏷️ *Title:* ${name}\n\n` +
                `💬 _"${desc}"_\n\n` +
                `_Nexus-1MD Simp Detector™_`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
