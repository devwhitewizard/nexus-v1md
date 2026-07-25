const { setGame } = require("../../lib/gameState");

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    name: "math",
    aliases: ["mathgame", "mathchallenge"],
    description: "Get a random math challenge. Type your answer to win!",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const ops = ["+", "-", "×", "÷"];
        const op  = ops[Math.floor(Math.random() * ops.length)];

        let a, b, answer, question;

        if (op === "+") {
            a = randomInt(10, 999); b = randomInt(10, 999);
            answer = a + b; question = `${a} + ${b}`;
        } else if (op === "-") {
            a = randomInt(50, 999); b = randomInt(1, a);
            answer = a - b; question = `${a} - ${b}`;
        } else if (op === "×") {
            a = randomInt(2, 50); b = randomInt(2, 50);
            answer = a * b; question = `${a} × ${b}`;
        } else {
            // Division — ensure clean result
            b = randomInt(2, 20);
            answer = randomInt(2, 50);
            a = answer * b;
            question = `${a} ÷ ${b}`;
        }

        setGame(jid, "math", { answer, question });

        await sock.sendMessage(jid, {
            text:
                `🧮 *MATH CHALLENGE*\n\n` +
                `❓ What is *${question}*?\n\n` +
                `_Type your answer! (no prefix needed)_`
        }, { quoted: msg });
    }
};
