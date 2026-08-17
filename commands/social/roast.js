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
    "You're a special kind of stupid — the kind that takes talent.",
    "You bring everyone so much joy when you leave the room.",
    "I'd agree with you, but then we'd both be wrong.",
    "You're not even worth the effort it takes to be rude to.",
    "I'd insult you, but nature already did the job.",
    "You're the human version of a Monday morning."
];

module.exports = {
    name: "roast",
    aliases: ["roastme", "burn", "burnout"],
    description: "Roast a user — tag them, reply to their message, or use alone to roast yourself.",
    category: "social",
    execute: async ({ sock, jid, msg, args, sender }) => {

        // Resolve target: 1. Mention, 2. Quoted message participant, 3. Sender themselves
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                            msg.message?.imageMessage?.contextInfo ||
                            msg.message?.videoMessage?.contextInfo;

        let targetJid = contextInfo?.mentionedJid?.[0] || contextInfo?.participant || null;

        // If no mention/reply, try args (e.g. .roast 254712345678)
        if (!targetJid && args && args[0] && !args[0].startsWith(".")) {
            const argStr = args[0].replace("@", "").replace(/\D/g, "");
            if (argStr.length > 5) {
                let digits = argStr;
                if (digits.startsWith("0")) digits = "254" + digits.slice(1);
                targetJid = `${digits}@s.whatsapp.net`;
            }
        }

        // Default: roast the sender themselves
        if (!targetJid) {
            targetJid = sender;
        }

        // Clean device suffix
        const cleanNum = targetJid.split("@")[0].split(":")[0].replace(/\D/g, "");
        const phoneJid = `${cleanNum}@s.whatsapp.net`;
        const isSelf = cleanNum === (sender.split("@")[0].split(":")[0].replace(/\D/g, ""));

        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        const burnLevel = ["Warm 🟡", "Hot 🟠", "FIRE 🔴", "NUCLEAR ☢️"][Math.floor(Math.random() * 4)];

        const targetLabel = isSelf ? "yourself" : `@${cleanNum}`;
        const mentionText = isSelf 
            ? `💀 You dared ask for it — *roasting yourself*...\n\n`
            : `Targeting @${cleanNum}...\n\n`;

        await sock.sendMessage(jid, {
            text:
                `🔥 *ROAST SESSION* 🔥\n\n` +
                mentionText +
                `💬 _"${roast}"_\n\n` +
                `🌡️ *Burn level:* ${burnLevel}\n` +
                `_Nexus-1MD Roast Engine™_`,
            mentions: [phoneJid]
        }, { quoted: msg });
    }
};
