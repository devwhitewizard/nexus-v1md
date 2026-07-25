const { setGame } = require("../../lib/gameState");

const WORDS = [
    "elephant","javascript","keyboard","waterfall","butterfly","umbrella",
    "chocolate","adventure","discovery","friendship","telescope","photograph",
    "hurricane","lightning","democracy","satellite","continent","dinosaur",
    "astronaut","submarine","algorithm","architecture","philosophy","university",
    "zebra","guitar","pyramid","dolphin","cactus","flamingo","galaxy","penguin",
    "tornado","volcano","rainbow","lantern","crystal","compass","blizzard","canyon",
    "lagoon","orchid","quartz","tundra","oasis","fjord","geyser","mangrove","savanna"
];

function buildDisplay(word, guessed) {
    return word.split("").map(ch => (/[a-z]/i.test(ch) ? (guessed.includes(ch.toLowerCase()) ? ch.toUpperCase() : "＿") : ch)).join(" ");
}

const GALLOWS = [
    " +--+\n |  |\n    |\n    |\n    |\n====",
    " +--+\n |  |\n O  |\n    |\n    |\n====",
    " +--+\n |  |\n O  |\n |  |\n    |\n====",
    " +--+\n |  |\n O  |\n/|  |\n    |\n====",
    " +--+\n |  |\n O  |\n/|\\ |\n    |\n====",
    " +--+\n |  |\n O  |\n/|\\ |\n/   |\n====",
    " +--+\n |  |\n O  |\n/|\\ |\n/ \\ |\n===="
];

module.exports = {
    name: "hangman",
    aliases: ["hang", "wordguess"],
    description: "Word guessing game — type one letter at a time!",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const display = buildDisplay(word, []);

        setGame(jid, "hangman", { word, guessed: [], wrong: [] });

        await sock.sendMessage(jid, {
            text:
                `\`\`\`${GALLOWS[0]}\`\`\`\n\n` +
                `🔤 *HANGMAN*\n\n` +
                `📝 Word: *${display}*\n` +
                `     (${word.length} letters)\n\n` +
                `❤️ Lives: ${"💚".repeat(6)}\n\n` +
                `_Type ONE letter to guess! You have 6 lives._`
        }, { quoted: msg });
    }
};
