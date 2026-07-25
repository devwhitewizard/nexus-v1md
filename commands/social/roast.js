const ROASTS = [
    "If brains were petrol, you wouldn't have enough to power an ant's motorbike around a mint.",
    "You're the human equivalent of a participation trophy.",
    "I'd say you're as sharp as a bowling ball, but that would be an insult to bowling balls.",
    "Your WiFi password is probably your IQ — single digit.",
    "You're the reason the gene pool needs a lifeguard.",
    "I'd roast you harder, but my mum told me not to burn trash.",
    "You're not stupid, you just have bad luck thinking.",
    "Somewhere out there, a tree is working very hard to replace the oxygen you waste.",
    "If laughter is the best medicine, your personality is the plague.",
    "You're about as useful as a screen door on a submarine.",
    "Your secrets are safe with me. I never listen when you talk anyway.",
    "You have miles to go before you reach mediocre.",
    "I'd explain it to you, but I left my crayons at home.",
    "You must have been born on a highway, because that's where most accidents happen.",
    "If you were a spice, you'd be flour — absolutely flavourless.",
    "Your birth certificate is an apology letter from the universe.",
    "I'd call you a tool, but even tools are useful.",
    "You are proof that even evolution makes mistakes.",
    "You look like something I drew with my left hand when I was five.",
    "Calling you an idiot would be an insult to idiots everywhere.",
    "You're not the dumbest person in the world, but you better hope they don't die.",
    "I've seen better heads on a pimple.",
    "Even your dog emails in more complete sentences than you speak.",
    "If you were any less clever, we'd have to water you.",
    "You're a special kind of stupid — the kind that takes talent."
];

module.exports = {
    name: "roast",
    aliases: ["roastme", "burn"],
    description: "Roast a mentioned user with a funny insult.",
    category: "social",
    execute: async ({ sock, jid, msg }) => {
        const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.roast @user`" });
        }

        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

        await sock.sendMessage(jid, {
            text:
                `🔥 *ROAST SESSION*\n\n` +
                `Targeting @${mentioned.split("@")[0]}...\n\n` +
                `💬 _"${roast}"_\n\n` +
                `🌡️ *Burn level:* ${["Warm 🟡", "Hot 🟠", "FIRE 🔴", "NUCLEAR ☢️"][Math.floor(Math.random() * 4)]}\n` +
                `_Nexus-1MD Roast Engine™_`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};
