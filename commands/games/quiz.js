const axios = require("axios");
const { setGame } = require("../../lib/gameState");

function decode(str) {
    return str.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
              .replace(/&quot;/g,"\"").replace(/&#039;/g,"'");
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Category pool: Science(17), Computers(18), Math(19), Gadgets(30)
const SCIENCE_CATS = [17, 18, 19, 30];

module.exports = {
    name: "quiz",
    aliases: ["quizme", "sciencequiz"],
    description: "Multiple choice quiz (science & tech). Type A, B, C or D.",
    category: "games",
    cooldown: 5000,
    execute: async ({ sock, jid, msg }) => {
        try {
            await sock.sendMessage(jid, { text: "🔬 Loading quiz question..." });

            const cat = SCIENCE_CATS[Math.floor(Math.random() * SCIENCE_CATS.length)];
            const { data } = await axios.get(
                `https://opentdb.com/api.php?amount=1&type=multiple&category=${cat}`,
                { timeout: 10000 }
            );

            if (data.response_code !== 0) throw new Error("Bad API response");

            const q = data.results[0];
            const question  = decode(q.question);
            const correct   = decode(q.correct_answer);
            const incorrect = q.incorrect_answers.map(decode);
            const options   = shuffle([correct, ...incorrect]);
            const letters   = ["A", "B", "C", "D"];
            const category  = decode(q.category);
            const difficulty = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);

            setGame(jid, "quiz", { correct, options, question });

            await sock.sendMessage(jid, {
                text:
                    `🔬 *QUIZ*  •  _${category}_\n` +
                    `🎯 Difficulty: *${difficulty}*\n\n` +
                    `❓ ${question}\n\n` +
                    options.map((o, i) => `${letters[i]}. ${o}`).join("\n") + "\n\n" +
                    `_Type A, B, C or D to answer!_`
            }, { quoted: msg });

        } catch (err) {
            console.error("Quiz error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to load quiz. Try again later." });
        }
    }
};
