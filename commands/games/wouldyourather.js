const WYR = [
    ["live without music for a year", "live without social media for a year"],
    ["always be 10 minutes late", "always be 20 minutes early"],
    ["be able to fly", "be able to become invisible"],
    ["know when you'll die", "know how you'll die"],
    ["never age physically", "never age mentally"],
    ["have unlimited money but no friends", "be broke but have amazing friends"],
    ["lose all your memories from age 0-15", "lose all your memories from age 15-30"],
    ["speak every language", "play every instrument"],
    ["be famous but unhappy", "be unknown but happy"],
    ["be too hot everywhere you go", "be too cold everywhere you go"],
    ["eat pizza for every meal", "eat sushi for every meal"],
    ["have a photographic memory", "be twice as intelligent"],
    ["live in the past", "live in the future"],
    ["fight 100 duck-sized horses", "fight 1 horse-sized duck"],
    ["be the funniest person in the room", "be the smartest person in the room"],
    ["never be able to lie", "never be able to tell the truth"],
    ["have unlimited free time but no money", "have unlimited money but no free time"],
    ["know all the secrets of the universe", "live a simple but truly happy life"],
    ["always have to sing instead of speak", "always have to dance instead of walk"],
    ["be able to read minds", "be able to see the future"],
    ["give up Netflix forever", "give up YouTube forever"],
    ["always feel overdressed", "always feel underdressed"],
    ["be permanently 10 years old mentally", "be permanently 80 years old mentally"],
    ["have a pause button for life", "have a rewind button for life"],
    ["only be able to whisper", "only be able to shout"],
    ["be allergic to your favourite food", "lose your sense of taste completely"],
    ["live in a world without cars", "live in a world without planes"],
    ["have Spiderman's powers", "have Batman's gadgets"],
    ["be a master chef", "be a master musician"],
    ["never use a phone again", "never watch TV again"],
];

module.exports = {
    name: "wouldyourather",
    aliases: ["wyr", "would"],
    description: "Get a random Would You Rather question.",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const [a, b] = WYR[Math.floor(Math.random() * WYR.length)];
        await sock.sendMessage(jid, {
            text:
                `🤔 *WOULD YOU RATHER?*\n\n` +
                `🅰️ *${a}*\n\n` +
                `— OR —\n\n` +
                `🅱️ *${b}*\n\n` +
                `_React or reply with A or B!_`
        }, { quoted: msg });
    }
};
