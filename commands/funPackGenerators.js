const SUPERPOWERS = [
    "Ability to turn anything you touch into lukewarm spaghetti.",
    "Can communicate with pigeons, but only about financial planning.",
    "Always knows exactly how many coins are in anyone's pocket.",
    "Can teleport, but only into the middle of a family dinner in Ohio.",
    "Ability to make anyone yawn instantly on demand."
];

const WEAKNESSES = [
    "You are physically allergic to the sound of typing.",
    "Every time you tell a lie, your left shoe gets slightly wet.",
    "You cannot walk past a mirror without saying 'Looking good, chief'.",
    "Your brain shuts down temporarily if someone mentions mayonnaise.",
    "You always laugh out loud during serious moments."
];

const JOBS = [
    "Professional Onion Peeler (Full-Time Cryer)",
    "Skibidi Toilet Consultant (Ohio branch)",
    "Professional Napper and Pillow Tester",
    "Mayonnaise Taster",
    "Emoji Interpreter to the President"
];

const PAST_LIVES = [
    "A wealthy Victorian aristocrat who died because he ate too much cake.",
    "A highly respected royal pigeon in Egypt.",
    "A legendary pirate captain who was terrified of water.",
    "A medieval blacksmith who accidentally invented the spork."
];

const PETS = [
    "A pet rock that requires daily walks.",
    "A highly emotional potato named Gary.",
    "A domestic raccoon that knows how to unlock phones.",
    "An invisible miniature giraffe."
];

const FOODS = [
    "A warm bowl of cereal but with chocolate milk.",
    "Pickles dipped in peanut butter.",
    "Pizza slices topped with cotton candy.",
    "Straight mustard from the bottle."
];

const MULTIVERSE = [
    "In Universe #482, you are a billionaire raccoon ruling the planet.",
    "In Universe #910, you are currently lecturing at Harvard about memes.",
    "In Universe #112, you are a professional tap dancer.",
    "In Universe #77, you are a WhatsApp bot designed by a human."
];

const REALITY = [
    "Your phone screen is not dirty; that is just your reflection.",
    "No one is ignoring you; they are just busy living a better life.",
    "If you think you're important, try commanding someone else's dog.",
    "You are unique, just like everyone else."
];

const DRIP_LEVELS = [
    "🔥 Immaculate Drip: 100/10 aura points!",
    "🕶️ Casual Swagger: Quite fashionable.",
    "😐 Average Fit: Grandma's closet vibes.",
    "💀 Cringe Alert: Socks with sandals detected!"
];

const TIERS = ["S-Tier (Godly)", "A-Tier (Elite)", "B-Tier (Average)", "C-Tier (Mid)", "D-Tier (Weak)", "F-Tier (NPC)"];

const ALIGNMENTS = [
    "🦸 Hero Archetype: Defender of the group chat's sanity.",
    "🦹 Villain Archetype: Enforces maximum chaos and spam."
];

const makeRaterCommand = (name, attribute, ratingLabel) => {
    return {
        name,
        description: `Rates how ${attribute} a user is`,
        category: "fun",
        execute: async ({ sock, jid, args, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant || 
                           (args[0] && args[0].includes("@") ? args[0] : null) ||
                           msg.key.participant || msg.key.remoteJid;
            
            const rate = Math.floor(Math.random() * 101);
            const filledCount = Math.round(rate / 10);
            const bar = "█".repeat(filledCount) + "░".repeat(10 - filledCount);
            
            await sock.sendMessage(jid, {
                text: `📊 *${ratingLabel.toUpperCase()} METER*\n\n` +
                      `👤 *User:* @${target.split("@")[0]}\n` +
                      `📈 *Rate:* ${rate}%\n` +
                      `[${bar}]\n\n` +
                      `_Nexus Analytics Engine_`,
                mentions: [target]
            }, { quoted: msg });
        }
    };
};

const makeGeneratorCommand = (name, label, list) => {
    return {
        name,
        description: `Generates a funny random ${name}`,
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const item = list[Math.floor(Math.random() * list.length)];
            await sock.sendMessage(jid, {
                text: `✨ *RANDOM ${label.toUpperCase()}*\n\n${item}\n\n_Powered by Nexus-1MD_`
            }, { quoted: msg });
        }
    };
};

module.exports = {
    coolness: makeRaterCommand("coolness", "cool", "Coolness"),
    sus: makeRaterCommand("sus", "sus", "Suspicion"),
    npc: makeRaterCommand("npc", "NPC", "NPC Aura"),
    power: makeRaterCommand("power", "powerful", "Power Level"),
    vibe: makeRaterCommand("vibe", "vibey", "Vibe Match"),
    mood: makeRaterCommand("mood", "moody", "Mood Frequency"),
    energy: makeRaterCommand("energy", "energetic", "Energy Match"),
    luckytoday: makeRaterCommand("luckytoday", "lucky today", "Daily Luck"),
    
    superpower: makeGeneratorCommand("superpower", "Superpower", SUPERPOWERS),
    weakness: makeGeneratorCommand("weakness", "Weakness", WEAKNESSES),
    job: makeGeneratorCommand("job", "Funny Profession", JOBS),
    pastlife: makeGeneratorCommand("pastlife", "Past Life Identity", PAST_LIVES),
    pet: makeGeneratorCommand("pet", "Weird Pet", PETS),
    food: makeGeneratorCommand("food", "Food Craving", FOODS),
    multiverse: makeGeneratorCommand("multiverse", "Multiverse Variant", MULTIVERSE),
    realitycheck: makeGeneratorCommand("realitycheck", "Reality Check", REALITY),

    future: {
        name: "future",
        description: "Predicts your future in a funny way",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const futures = [
                "You will marry a millionaire raccoon and inherit a trash can empire.",
                "You will become the leader of an underground emoji-translation cult.",
                "You will invent a device that turns water into root beer and become famous.",
                "You will spend the rest of your life looking for your glasses while they are on your head."
            ];
            const item = futures[Math.floor(Math.random() * futures.length)];
            await sock.sendMessage(jid, { text: `🔮 *FUTURE PREDICTION*\n\n${item}\n\n_Stay alert!_` }, { quoted: msg });
        }
    },
    drip: {
        name: "drip",
        aliases: ["fitcheck"],
        description: "Evaluates a user's drip/outfit fashion",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant || 
                           msg.key.participant || msg.key.remoteJid;
            const drip = DRIP_LEVELS[Math.floor(Math.random() * DRIP_LEVELS.length)];
            await sock.sendMessage(jid, {
                text: `🕶️ *DRIP CHECK* 🕶️\n\nUser: @${target.split("@")[0]}\n\nRating: *${drip}*`,
                mentions: [target]
            }, { quoted: msg });
        }
    },
    tier: {
        name: "tier",
        description: "Places a user in a tier list",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant || 
                           msg.key.participant || msg.key.remoteJid;
            const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
            await sock.sendMessage(jid, {
                text: `🏆 *TIER LIST PLACEMENT*\n\nUser: @${target.split("@")[0]}\n\nTier: *${tier}*`,
                mentions: [target]
            }, { quoted: msg });
        }
    },
    hero: {
        name: "hero",
        description: "Checks if a user is a Hero",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant || 
                           msg.key.participant || msg.key.remoteJid;
            const align = ALIGNMENTS[0];
            await sock.sendMessage(jid, {
                text: `🦸 *HERO CLASSIFICATION*\n\nUser: @${target.split("@")[0]}\n\nStatus: *${align}*`,
                mentions: [target]
            }, { quoted: msg });
        }
    },
    villain: {
        name: "villain",
        description: "Checks if a user is a Villain",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant || 
                           msg.key.participant || msg.key.remoteJid;
            const align = ALIGNMENTS[1];
            await sock.sendMessage(jid, {
                text: `🦹 *VILLAIN CLASSIFICATION*\n\nUser: @${target.split("@")[0]}\n\nStatus: *${align}*`,
                mentions: [target]
            }, { quoted: msg });
        }
    }
};
