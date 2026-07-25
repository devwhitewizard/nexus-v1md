const DAD_JOKES = [
    "I'm reading a book on anti-gravity. I just can't put it down!",
    "Why don't skeletons fight each other? They don't have the guts.",
    "What do you call a factory that makes okay products? A satisfactory.",
    "Did you hear about the guy who invented the knock-knock joke? He won the no-bell prize.",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "How does a penguin build its house? Igloos it together!",
    "I used to play piano by ear, but now I use my hands.",
    "Why do we tell actors to 'break a leg'? Because every play has a cast!"
];

const PUNS = [
    "Time flies like an arrow, but fruit flies like a banana.",
    "I've been holding in a urine joke, but I don't want to piss anyone off.",
    "Light travels faster than sound. That's why some people appear bright until you hear them speak.",
    "An eyeball's favorite song is 'Eye of the Tiger'.",
    "I'm positive that I lost my electron, but I have to keep an atom-ic smile.",
    "Being a baker is a piece of cake."
];

const USELESS_FACTS = [
    "Sloths can hold their breath longer than dolphins can.",
    "The average person spends two weeks of their life waiting for traffic lights to change.",
    "A single cloud can weigh more than 1 million pounds.",
    "Bananas are curved because they grow towards the sun.",
    "Donald Duck comics were once banned in Finland because he doesn't wear pants."
];

const SHOWER_THOUGHTS = [
    "Your alarm sound is technically your theme song since it plays at the start of every episode of your day.",
    "If you're waiting for the waiter at a restaurant, aren't you the waiter?",
    "Every mirror you buy is used.",
    "Technically, your stomach thinks all potatoes are mashed.",
    "If two telepaths read each other's minds, whose mind are they reading?"
];

const SARCASM = [
    "Oh, I'm sorry. Did the middle of my sentence interrupt the beginning of yours?",
    "Keep rolling your eyes, maybe you'll find a brain back there.",
    "Sarcasm is the body's natural defense against stupidity.",
    "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
    "I’m not saying I hate you, what I'm saying is that you are literally the Monday of my life."
];

const FORTUNES = [
    "You will soon receive a highly suspicious text from a Nigerian Prince. Do not reply.",
    "A great fortune awaits you in the fridge. Go check it now.",
    "Avoid taking advice from anyone today, including this bot.",
    "You will become rich, but only in WhatsApp sticker collections.",
    "A clean room is a sign of a wasted life. Keep it messy."
];

const WEIRD_FACTS = [
    "Wombat poop is cube-shaped. This stops it from rolling away!",
    "The world's oldest toy is a stick.",
    "Before erasers, people used rolled-up pieces of white bread to rub out pencil marks.",
    "Ketchup was sold in the 1830s as medicine for indigestion."
];

const FAKE_QUOTES = [
    ["I will fight anyone who does not believe in gravity.", "Isaac Newton"],
    ["Honestly, I just wanted to sleep, but they made me write this play.", "William Shakespeare"],
    ["The problem with internet quotes is that you cannot verify their accuracy.", "Abraham Lincoln"],
    ["I did not invent the lightbulb, I just bought the patent.", "Thomas Edison"],
    ["Make sure you subscribe and hit the bell icon.", "Jesus Christ"]
];

const CONFESSIONS = [
    "I once ate my roommate's left-over pizza and blamed it on a imaginary raccoon.",
    "I tell my boss that I'm working from home, but I am actually at a waterpark.",
    "I secretly reuse the same birthday card for three different friends.",
    "I pretend to be on a phone call just to avoid talking to people in public."
];

const DRAMA_TEA = [
    "Spotted: @user was seen typing a message for 20 minutes only to reply with 'k'. The audacity!",
    "Rumor has it @user has been secretly viewing statuses in stealth mode.",
    "Leaked: @user's search history is 90% cringe memes.",
    "Is @user planning a group takeover? Stay tuned to find out!"
];

const CHAOS = [
    "⚠️ System Alert: Chaos level is currently at 99%. Please proceed with caution.",
    "🎲 You just triggered a chaotic event! All your stickers have been converted into emotional damage.",
    "👾 A virtual goblin stole 5 of your brain cells. You now have -2 left.",
    "🔥 Warning: An explosion of pure nonsense has occurred in this chat."
];

const BRAINROT = [
    "Skibidi toilet Ohio rizzler Fanum tax baby gronky sigma mewing streak gyatt!",
    "Bro is mewing in Ohio with negative infinity aura 💀💀",
    "Only a true Sigma can hit the griddy on the Fanum tax.",
    "Riddle me this, Rizzler, who is the gyatt of Ohio?"
];

const CURSED = [
    "Imagine drinking orange juice right after brushing your teeth. Forever.",
    "What if your toes had teeth and your teeth had toes?",
    "Every time you sneeze, a random potato somewhere in the world explodes.",
    "Bro has wet socks energy."
];

const CRINGE = [
    "Remember that time in 3rd grade when you called the teacher 'Mom'? Yeah, they remember too.",
    "Bro is definitely the type to wave back at someone who was waving to the person behind them.",
    "Bro claps when the airplane lands.",
    "Bro says 'you too' when the waiter says 'enjoy your meal'."
];

// Helper to send a simple random item response
const sendRandom = async (sock, jid, msg, prefix, list, footer = "Nexus-1MD Fun") => {
    const item = list[Math.floor(Math.random() * list.length)];
    await sock.sendMessage(jid, {
        text: `✨ *${prefix}*\n\n${item}\n\n_${footer}_`
    }, { quoted: msg });
};

module.exports = {
    dadjoke: {
        name: "dadjoke",
        description: "Sends a corny dad joke",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "DAD JOKE", DAD_JOKES);
        }
    },
    pun: {
        name: "pun",
        description: "Sends a funny pun",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "FUNNY PUN", PUNS);
        }
    },
    uselessfact: {
        name: "uselessfact",
        description: "Sends a completely useless fact",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "USELESS FACT", USELESS_FACTS);
        }
    },
    showerthought: {
        name: "showerthought",
        description: "Sends a mind-bending shower thought",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "SHOWER THOUGHT", SHOWER_THOUGHTS);
        }
    },
    sarcasm: {
        name: "sarcasm",
        description: "Sends a sarcastic response",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "SARCASTIC VIBE", SARCASM);
        }
    },
    fortune: {
        name: "fortune",
        description: "Tells your daily fortune",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "DAILY FORTUNE", FORTUNES);
        }
    },
    weirdfact: {
        name: "weirdfact",
        description: "Sends a weird/bizarre fact",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "WEIRD FACT", WEIRD_FACTS);
        }
    },
    fakequote: {
        name: "fakequote",
        description: "Sends a fake quote attributed to the wrong person",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const [quote, author] = FAKE_QUOTES[Math.floor(Math.random() * FAKE_QUOTES.length)];
            await sock.sendMessage(jid, {
                text: `📜 *FAKE QUOTE*\n\n_"${quote}"_\n\n— *${author}*\n\n_Don't believe everything on the internet!_`
            }, { quoted: msg });
        }
    },
    confession: {
        name: "confession",
        description: "Sends a funny anonymous confession",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "ANONYMOUS CONFESSION", CONFESSIONS);
        }
    },
    drama: {
        name: "drama",
        description: "Generates high-tension group drama",
        category: "fun",
        execute: async ({ sock, jid, msg, isGroup }) => {
            const dramaStr = DRAMA_TEA[Math.floor(Math.random() * DRAMA_TEA.length)];
            if (isGroup) {
                try {
                    const metadata = await sock.groupMetadata(jid);
                    const members = metadata.participants.map(p => p.id);
                    const randomMember = members[Math.floor(Math.random() * members.length)];
                    const formatted = dramaStr.replace("@user", `@${randomMember.split("@")[0]}`);
                    await sock.sendMessage(jid, { text: `🎭 *DRAMA UPDATE*\n\n${formatted}\n\n_Nexus Scandal Engine_`, mentions: [randomMember] }, { quoted: msg });
                } catch (e) {
                    await sendRandom(sock, jid, msg, "DRAMA UPDATE", ["Someone in this chat is acting highly suspicious..."]);
                }
            } else {
                await sock.sendMessage(jid, { text: "⚠️ Drama can only be generated in group chats!" }, { quoted: msg });
            }
        }
    },
    tea: {
        name: "tea",
        description: "Gives a random gossip-style message",
        category: "fun",
        execute: async ({ sock, jid, msg, isGroup }) => {
            const teaList = [
                "Rumor has it @user left their chat on read because they forgot how to spell 'definitely'.",
                "Did you know @user secretly plays Roblox while in meetings?",
                "Rumor is @user once spent 2 hours searching for their phone while using their phone flashlight.",
                "Word on the street is @user's favorite food is mayonnaise out of the jar."
            ];
            const teaStr = teaList[Math.floor(Math.random() * teaList.length)];
            if (isGroup) {
                try {
                    const metadata = await sock.groupMetadata(jid);
                    const members = metadata.participants.map(p => p.id);
                    const randomMember = members[Math.floor(Math.random() * members.length)];
                    const formatted = teaStr.replace("@user", `@${randomMember.split("@")[0]}`);
                    await sock.sendMessage(jid, { text: `🍵 *GOSSIP TEA*\n\n${formatted}\n\n_Nexus Tea Dispenser_`, mentions: [randomMember] }, { quoted: msg });
                } catch (e) {
                    await sendRandom(sock, jid, msg, "GOSSIP TEA", ["Someone in this chat just deleted a highly controversial text..."]);
                }
            } else {
                await sock.sendMessage(jid, { text: "⚠️ Tea is best served in group chats!" }, { quoted: msg });
            }
        }
    },
    chaos: {
        name: "chaos",
        description: "Generates a random chaotic event",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "CHAOS MODIFIER", CHAOS);
        }
    },
    randomthought: {
        name: "randomthought",
        aliases: ["thought"],
        description: "Sends an absurd random thought",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const thoughts = [
                "What if dogs are actually intelligent and only act dumb to avoid paying taxes?",
                "If we clean a vacuum cleaner, do we become a vacuum cleaner?",
                "If your shirt isn't tucked into your pants, are your pants tucked into your shirt?",
                "Why is it called building when it is already built?"
            ];
            await sendRandom(sock, jid, msg, "RANDOM THOUGHT", thoughts);
        }
    },
    brainrot: {
        name: "brainrot",
        description: "Sends a pure Gen-Z brainrot phrase",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "GEN-Z BRAINROT", BRAINROT);
        }
    },
    cursed: {
        name: "cursed",
        description: "Sends an absurd/cursed thought",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "CURSED IMAGINATION", CURSED);
        }
    },
    nonsense: {
        name: "nonsense",
        description: "Sends pure nonsense text",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            const nonsense = [
                "Bloop, bleep, the flying potato has landed in the cabbage patch.",
                "Wiggle the pickle and turn the noodle, the space turtle says hello.",
                "Flatulent frogs flying forward frantically towards Friday.",
                "If a tree falls in the forest and no one is around, does it make a sound like a saxophone?"
            ];
            await sendRandom(sock, jid, msg, "NONSENSE FREQUENCY", nonsense);
        }
    },
    cringe: {
        name: "cringe",
        description: "Sends an awkward or cringe situation description",
        category: "fun",
        execute: async ({ sock, jid, msg }) => {
            await sendRandom(sock, jid, msg, "CRINGE MOMENT", CRINGE);
        }
    }
};
