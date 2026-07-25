const { setGame } = require("../../lib/gameState");

module.exports = {
    name: "guess",
    aliases: ["guessnumber", "numguess"],
    description: "Guess the secret number between 1 and 100! (7 attempts)",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const target = Math.floor(Math.random() * 100) + 1;
        setGame(jid, "guess", { target, attempts: 0, max: 7 });

        await sock.sendMessage(jid, {
            text:
                `🎲 *NUMBER GUESSING GAME*\n\n` +
                `I'm thinking of a number between *1 and 100*.\n` +
                `You have *7 attempts* to guess it!\n\n` +
                `_Type any number to start guessing!_`
        }, { quoted: msg });
    }
};
