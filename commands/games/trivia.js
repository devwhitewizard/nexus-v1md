const axios = require("axios");
const { setGame } = require("../../lib/gameState");

// Decode HTML entities from Open Trivia DB
function decode(str) {
    return str.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
              .replace(/&quot;/g,"\"").replace(/&#039;/g,"'").replace(/&ldquo;/g,"\"")
              .replace(/&rdquo;/g,"\"").replace(/&ndash;/g,"–").replace(/&mdash;/g,"—");
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

module.exports = {
    name: "trivia",
    aliases: ["triva", "triviaQ"],
    description: "Start a random trivia question. Type A, B, C or D to answer.",
    category: "games",
    cooldown: 5000,
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "🧠 Loading trivia question..." });

            const { data } = await axios.get(
                "https://opentdb.com/api.php?amount=1&type=multiple",
                { timeout: 10000 }
            );

            if (data.response_code !== 0) throw new Error("Bad API response");

            const q = data.results[0];
            const question   = decode(q.question);
            const correct    = decode(q.correct_answer);
            const incorrect  = q.incorrect_answers.map(decode);
            const options    = shuffle([correct, ...incorrect]);
            const letters    = ["A", "B", "C", "D"];
            const difficulty = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
            const category   = decode(q.category);

            const optText = options.map((o, i) => `${letters[i]}. ${o}`).join("\n");

            setGame(jid, "trivia", { correct, options, question });

            await sock.sendMessage(jid, {
                text:
                    `🧠 *TRIVIA*  •  _${category}_\n` +
                    `🎯 Difficulty: *${difficulty}*\n\n` +
                    `❓ ${question}\n\n` +
                    `${optText}\n\n` +
                    `_Type A, B, C or D to answer!_`
            }, { quoted: msg });

        } catch (err) {
            console.error("Trivia error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to load trivia. Try again later." });
        }
    }
};
