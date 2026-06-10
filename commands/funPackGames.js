const RPS_CHOICES = ["rock", "paper", "scissors"];
const RPS_EMOJIS = { rock: "🪨", paper: "📄", scissors: "✂️" };

const TRUTHS = [
    "What is the most embarrassing thing you've done in public?",
    "Who is your secret crush in this group chat?",
    "What is the biggest lie you've ever told your parents?",
    "If you could delete one person from this group, who would it be?"
];

const DARES = [
    "Send a screenshot of your search history to the group.",
    "Send a voice note singing your favorite song poorly.",
    "Message your crush and tell them they smell like cabbage, then screenshot it.",
    "Change your WhatsApp profile status to 'I love onions' for 24 hours."
];

const RIDDLES = [
    { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "echo" },
    { q: "You measure my life in hours and I serve you by expiring. I'm quick when I'm thin and slow when I'm fat. The wind is my enemy. What am I?", a: "candle" },
    { q: "I have keys but no locks. I have space but no room. You can enter but can't go outside. What am I?", a: "keyboard" }
];

const NEVER_HAVE_I_EVER = [
    "Never have I ever sent a text to the wrong group chat and regretted it.",
    "Never have I ever pretended to be sick just to play video games.",
    "Never have I ever eaten food off the floor after the 5-second rule expired.",
    "Never have I ever stalking my ex on social media."
];

const QUESTS = [
    "🧹 *Clean the Chat:* Send 3 premium stickers within 30 seconds.",
    "🎙️ *Voice of an Angel:* Send a 5-second voice note singing any song.",
    "🎭 *Drama Creator:* Roast the owner of this group (good luck!)."
];

module.exports = {
    rps: {
        name: "rps",
        description: "Play Rock, Paper, Scissors against the bot",
        category: "games",
        execute: async ({ sock, jid, args, msg }) => {
            const userChoice = (args[0] || "").toLowerCase();
            if (!RPS_CHOICES.includes(userChoice)) {
                return await sock.sendMessage(jid, { text: "🎮 *Usage:* `.rps [rock|paper|scissors]`" }, { quoted: msg });
            }

            const botChoice = RPS_CHOICES[Math.floor(Math.random() * RPS_CHOICES.length)];
            let result = "";

            if (userChoice === botChoice) {
                result = "🤝 *It's a tie!*";
            } else if (
                (userChoice === "rock" && botChoice === "scissors") ||
                (userChoice === "paper" && botChoice === "rock") ||
                (userChoice === "scissors" && botChoice === "paper")
            ) {
                result = "🏆 *You win!* 🎉";
            } else {
                result = "💀 *Bot wins!*";
            }

            await sock.sendMessage(jid, {
                text: `🎮 *ROCK-PAPER-SCISSORS*\n\n` +
                      `👤 *You:* ${RPS_EMOJIS[userChoice]} ${userChoice.toUpperCase()}\n` +
                      `🤖 *Bot:* ${RPS_EMOJIS[botChoice]} ${botChoice.toUpperCase()}\n\n` +
                      `${result}`
            }, { quoted: msg });
        }
    },
    coinflip: {
        name: "coinflip",
        aliases: ["flip"],
        description: "Flips a coin",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const side = Math.random() < 0.5 ? "HEADS 🪙" : "TAILS 🪙";
            await sock.sendMessage(jid, { text: `🪙 *COIN FLIP*\n\nThe coin landed on: *${side}*` }, { quoted: msg });
        }
    },
    dice: {
        name: "dice",
        aliases: ["roll"],
        description: "Rolls a 6-sided die",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const roll = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
            await sock.sendMessage(jid, { text: `🎲 *DICE ROLL*\n\nYou rolled a: *${roll}* ${diceEmojis[roll - 1]}` }, { quoted: msg });
        }
    },
    truthordare: {
        name: "truthordare",
        aliases: ["tod"],
        description: "Classic Truth or Dare selector",
        category: "games",
        execute: async ({ sock, jid, args, msg }) => {
            const choice = (args[0] || "").toLowerCase();
            if (choice === "truth" || choice === "t") {
                const truth = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
                await sock.sendMessage(jid, { text: `❓ *TRUTH*\n\n_${truth}_` }, { quoted: msg });
            } else if (choice === "dare" || choice === "d") {
                const dare = DARES[Math.floor(Math.random() * DARES.length)];
                await sock.sendMessage(jid, { text: `😈 *DARE*\n\n_${dare}_` }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: "🎮 *Usage:* `.tod [truth|dare]` or `.truth` / `.dare`" }, { quoted: msg });
            }
        }
    },
    neverhaveiever: {
        name: "neverhaveiever",
        aliases: ["nhie"],
        description: "Generates a Never Have I Ever question",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const nhie = NEVER_HAVE_I_EVER[Math.floor(Math.random() * NEVER_HAVE_I_EVER.length)];
            await sock.sendMessage(jid, { text: `🙅‍♂️ *NEVER HAVE I EVER*\n\n${nhie}\n\n_Take a sip if you have done it!_` }, { quoted: msg });
        }
    },
    hotseat: {
        name: "hotseat",
        description: "Generates a deep question for the tagged user",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return await sock.sendMessage(jid, { text: "⚠️ Tag or reply to a user to put them in the hotseat!" }, { quoted: msg });
            
            const questions = [
                "If you could change one thing about yourself, what would it be?",
                "What's your biggest regret in life so far?",
                "What is a secret you've never shared with anyone in this chat?",
                "What is your actual opinion of this group?"
            ];
            const q = questions[Math.floor(Math.random() * questions.length)];
            await sock.sendMessage(jid, { 
                text: `🔥 *HOTSEAT* 🔥\n\n@${target.split("@")[0]}, you are in the hotseat! Answer this honestly:\n\n*${q}*`,
                mentions: [target] 
            }, { quoted: msg });
        }
    },
    emojiquiz: {
        name: "emojiquiz",
        description: "Emoji trivia challenge",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const quizzes = [
                { q: "🦁👑", a: "The Lion King" },
                { q: "🕷️👦", a: "Spider-Man" },
                { q: "🚢❄️💔", a: "Titanic" },
                { q: "🦖🏝️🍿", a: "Jurassic Park" }
            ];
            const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
            await sock.sendMessage(jid, { text: `🧩 *EMOJI QUIZ*\n\nGuess the movie/franchise:\n\n👉 *${quiz.q}* 👈\n\n_Answer: ||${quiz.a}|| (Reveal to check!)` }, { quoted: msg });
        }
    },
    scramble: {
        name: "scramble",
        description: "Word scramble puzzle",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const words = [
                { word: "whatsapp", scrambled: "asthpawn" },
                { word: "javascript", scrambled: "acisvjtapr" },
                { word: "database", scrambled: "seabdata" },
                { word: "computer", scrambled: "rmpcuote" }
            ];
            const w = words[Math.floor(Math.random() * words.length)];
            await sock.sendMessage(jid, { text: `🧩 *WORD SCRAMBLE*\n\nUnscramble this word:\n\n👉 *${w.scrambled}* 👈\n\n_Answer: ||${w.word}||` }, { quoted: msg });
        }
    },
    fasttype: {
        name: "fasttype",
        description: "Generates a word typing speed challenge",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const sentences = [
                "The quick brown fox jumps over the lazy dog.",
                "Sphinx of black quartz, judge my vow.",
                "WhatsApp bots are extremely awesome."
            ];
            const s = sentences[Math.floor(Math.random() * sentences.length)];
            await sock.sendMessage(jid, { text: `⌨️ *FAST TYPE CHALLENGE*\n\nType this sentence as fast as you can:\n\n_"${s}"_` }, { quoted: msg });
        }
    },
    spamword: {
        name: "spamword",
        description: "A funny spam word challenge",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const words = ["SIGMA", "SKIBIDI", "NEXUS", "AURAPOINT"];
            const word = words[Math.floor(Math.random() * words.length)];
            await sock.sendMessage(jid, { text: `📢 *SPAM WORD CHALLENGE*\n\nWrite *${word}* 5 times in a row without making a mistake!` }, { quoted: msg });
        }
    },
    reactiongame: {
        name: "reactiongame",
        description: "Simulates a reaction game challenge",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            await sock.sendMessage(jid, { text: `⚡ *REACTION GAME*\n\nGet ready...\n\n🟢 *REACT NOW!* (React with any emoji to this message!)` }, { quoted: msg });
        }
    },
    clickfast: {
        name: "clickfast",
        description: "Quick-click reaction prompt",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            await sock.sendMessage(jid, { text: `🎯 *CLICK FAST*\n\nReply to this message with 'HIT' immediately!` }, { quoted: msg });
        }
    },
    luck: {
        name: "luck",
        description: "Calculates your luck percentage",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const percent = Math.floor(Math.random() * 101);
            let rating = "";
            if (percent > 80) rating = "🍀 *Jackpot Luck!*";
            else if (percent > 50) rating = "👍 *Good Luck!*";
            else if (percent > 20) rating = "😐 *Average Luck.*";
            else rating = "💀 *Unlucky. Stay inside.*";

            await sock.sendMessage(jid, { text: `🎲 *LUCK METER*\n\nYour luck score today is: *${percent}%*\n\n${rating}` }, { quoted: msg });
        }
    },
    battle: {
        name: "battle",
        description: "Simulate a battle against another user",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return await sock.sendMessage(jid, { text: "⚠️ Tag a user to battle!" }, { quoted: msg });

            const weapons = ["a wet noodle", "a keyboard", "ban hammer", "emotional damage", "Skibidi Toilet logic"];
            const weapon = weapons[Math.floor(Math.random() * weapons.length)];
            const userWon = Math.random() < 0.5;

            const sender = msg.key.participant || msg.key.remoteJid;

            const text = userWon 
                ? `⚔️ *BATTLE RESULT*\n\n@${sender.split("@")[0]} attacked @${target.split("@")[0]} with *${weapon}* and scored a *CRITICAL HIT!*\n\n🏆 Winner: *@${sender.split("@")[0]}*`
                : `⚔️ *BATTLE RESULT*\n\n@${sender.split("@")[0]} tried to attack @${target.split("@")[0]} with *${weapon}*, but missed completely and tripped!\n\n🏆 Winner: *@${target.split("@")[0]}*`;

            await sock.sendMessage(jid, { text, mentions: [sender, target] }, { quoted: msg });
        }
    },
    duel: {
        name: "duel",
        description: "Duel another user",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return await sock.sendMessage(jid, { text: "⚠️ Tag a user to duel!" }, { quoted: msg });

            const sender = msg.key.participant || msg.key.remoteJid;
            const draw = Math.random() < 0.5;

            const text = draw 
                ? `🔫 *DUEL* 🔫\n\n@${sender.split("@")[0]} and @${target.split("@")[0]} drew their guns...\n\n💥 *BANG!* @${sender.split("@")[0]} shot faster and won the duel!`
                : `🔫 *DUEL* 🔫\n\n@${sender.split("@")[0]} and @${target.split("@")[0]} drew their guns...\n\n💥 *BANG!* @${target.split("@")[0]} dodged and counter-shot to victory!`;

            await sock.sendMessage(jid, { text, mentions: [sender, target] }, { quoted: msg });
        }
    },
    survive: {
        name: "survive",
        description: "Check if you survive a zombie apocalypse scenario",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const percent = Math.floor(Math.random() * 101);
            let desc = "";
            if (percent > 90) desc = "You successfully rebuilt civilization! 🏰";
            else if (percent > 60) desc = "You survived by eating canned beans and hiding in a tree. 🌲";
            else if (percent > 30) desc = "You got bitten but managed to run away. 🧟";
            else desc = "You were the first one to get eaten in the movie. 💀";

            await sock.sendMessage(jid, { text: `🧟 *SURVIVAL PROBABILITY*\n\nYour survival rate in a zombie apocalypse: *${percent}%*\n\n${desc}` }, { quoted: msg });
        }
    },
    escape: {
        name: "escape",
        description: "Tries to escape a bizarre situation",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const scenarios = [
                "You tried to escape a boring family dinner by jumping out the bathroom window. *Success!*",
                "You tried to escape the police by hiding inside a cardboard box. *Failed!* They saw you moving.",
                "You tried to escape the Rizzler's gaze. *Success!* Your aura points are safe."
            ];
            const s = scenarios[Math.floor(Math.random() * scenarios.length)];
            await sock.sendMessage(jid, { text: `🏃‍♂️ *ESCAPE ATTEMPT*\n\n${s}` }, { quoted: msg });
        }
    },
    heist: {
        name: "heist",
        description: "Simulates a group bank heist",
        category: "games",
        execute: async ({ sock, jid, msg, isGroup }) => {
            if (!isGroup) return await sock.sendMessage(jid, { text: "⚠️ Heist simulation can only be triggered in group chats!" }, { quoted: msg });
            try {
                const metadata = await sock.groupMetadata(jid);
                const members = metadata.participants.map(p => p.id);
                const robbers = [
                    members[Math.floor(Math.random() * members.length)],
                    members[Math.floor(Math.random() * members.length)]
                ];
                const cleanRobbers = [...new Set(robbers)];
                const reward = Math.floor(Math.random() * 100000) + 10000;
                
                const text = `🏦 *BANK HEIST SIMULATION*\n\n` +
                             `👥 *Crew:* ${cleanRobbers.map(r => `@${r.split("@")[0]}`).join(" and ")}\n` +
                             `🚗 *Outcome:* The crew successfully bypassed security and escaped with *KSH ${reward}*! 🎉`;
                
                await sock.sendMessage(jid, { text, mentions: cleanRobbers }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "🏦 *Heist failed:* The getaway driver overslept!" }, { quoted: msg });
            }
        }
    },
    adventure: {
        name: "adventure",
        description: "Goes on a text-based mini RPG adventure",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const outcomes = [
                "You entered a dark cave, found a legendary chest containing *1,000 XP*, and returned safely! 💎",
                "You fought a wild slime, lost your left shoe, but gained a cool sword! 🗡️",
                "You visited a tavern, drank too much root beer, and lost all your aura points. 🍺"
            ];
            const o = outcomes[Math.floor(Math.random() * outcomes.length)];
            await sock.sendMessage(jid, { text: `⚔️ *MINI RPG ADVENTURE*\n\n${o}` }, { quoted: msg });
        }
    },
    quest: {
        name: "quest",
        description: "Accept a random quest challenge",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const q = QUESTS[Math.floor(Math.random() * QUESTS.length)];
            await sock.sendMessage(jid, { text: `📜 *QUEST ASSIGNED*\n\n${q}\n\n_Execute the challenge to prove your worth!_` }, { quoted: msg });
        }
    },
    bossfight: {
        name: "bossfight",
        description: "Fight a random boss",
        category: "games",
        execute: async ({ sock, jid, msg }) => {
            const bosses = ["Gigachad", "Skibidi Emperor", "Uncaught Exception", "The Final Boss of Ohio"];
            const boss = bosses[Math.floor(Math.random() * bosses.length)];
            const won = Math.random() < 0.5;

            const text = won 
                ? `👹 *BOSS FIGHT RESULT*\n\nYou challenged *${boss}* to mortal combat...\n\n💥 *BOOM!* You hit him with a database rollback and *DEFEATED* the boss! 🏆`
                : `👹 *BOSS FIGHT RESULT*\n\nYou challenged *${boss}* to mortal combat...\n\n💥 *CRASH!* The boss threw a syntax error and *OBLITERATED* you! 💀`;

            await sock.sendMessage(jid, { text }, { quoted: msg });
        }
    }
};
