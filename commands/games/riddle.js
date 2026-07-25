const { setGame } = require("../../lib/gameState");

const RIDDLES = [
    { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", a: "echo", hint: "Listen carefully in a cave" },
    { q: "The more you take, the more you leave behind. What am I?", a: "footsteps", hint: "Think about walking" },
    { q: "I have cities but no houses, mountains but no trees, and water but no fish. What am I?", a: "map", hint: "You navigate with me" },
    { q: "I can fly without wings. I can be caught but not thrown. What am I?", a: "cold", hint: "You feel me when sick" },
    { q: "What has hands but can't clap?", a: "clock", hint: "It tells you something every minute" },
    { q: "I'm light as a feather, but even the strongest man can't hold me for more than 5 minutes. What am I?", a: "breath", hint: "You need me to live" },
    { q: "The more you have of it, the less you see. What is it?", a: "darkness", hint: "It's what happens when lights go out" },
    { q: "I have a head and a tail but no body. What am I?", a: "coin", hint: "Money has two faces" },
    { q: "What gets wetter the more it dries?", a: "towel", hint: "Found in your bathroom" },
    { q: "I'm always in front of you but can't be seen. What am I?", a: "future", hint: "Tomorrow is part of me" },
    { q: "What has teeth but cannot bite?", a: "comb", hint: "You use it on your hair" },
    { q: "I shrink every time you use me. What am I?", a: "soap", hint: "Found in the shower" },
    { q: "What has one eye but cannot see?", a: "needle", hint: "Used for sewing" },
    { q: "I have keys but no locks, space but no room, and you can enter but can't go inside. What am I?", a: "keyboard", hint: "You use me to type" },
    { q: "What goes up but never comes back down?", a: "age", hint: "It happens every birthday" },
    { q: "I'm tall when I'm young and short when I'm old. What am I?", a: "candle", hint: "I give light and melt" },
    { q: "What can you break even if you never pick it up or touch it?", a: "promise", hint: "Trust is involved" },
    { q: "I have branches but no fruit, trunk but no bark, and roots but no leaves. What am I?", a: "bank", hint: "Money lives here" },
    { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "m", hint: "Look at the words carefully" },
    { q: "What has four wheels and flies?", a: "garbage truck", hint: "It carries something that smells" },
];

module.exports = {
    name: "riddle",
    aliases: ["riddleme", "brainteaser"],
    description: "Answer a riddle! Type your answer or type 'hint' for a clue.",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
        setGame(jid, "riddle", { answer: r.a, hint: r.hint });

        await sock.sendMessage(jid, {
            text:
                `🤔 *RIDDLE TIME!*\n\n` +
                `❓ ${r.q}\n\n` +
                `_Type your answer — or type \`hint\` if you're stuck!_`
        }, { quoted: msg });
    }
};
