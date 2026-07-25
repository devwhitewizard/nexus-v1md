const axios = require("axios");

module.exports = {
    name: "joke",
    aliases: ["jokes", "funny", "jokeme"],
    description: "Get a random joke.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        try {
            const { data } = await axios.get(
                "https://v2.jokeapi.dev/joke/Any?safe-mode&blacklistFlags=nsfw,racist,sexist&type=twopart,single",
                { timeout: 10000 }
            );

            let jokeText = "";
            if (data.type === "twopart") {
                jokeText = `😂 *JOKE OF THE DAY*\n\n📢 ${data.setup}\n\n🎯 _${data.delivery}_`;
            } else {
                jokeText = `😂 *JOKE OF THE DAY*\n\n📢 ${data.joke}`;
            }

            jokeText += `\n\n_Nexus-1MD Laugh Factory 🎤_`;
            await sock.sendMessage(jid, { text: jokeText }, { quoted: msg });

        } catch (err) {
            // Fallback local jokes
            const LOCAL = [
                { setup: "Why don't scientists trust atoms?", delivery: "Because they make up everything!" },
                { setup: "What do you call a fake noodle?", delivery: "An impasta!" },
                { setup: "Why can't you give Elsa a balloon?", delivery: "Because she'll let it go!" },
                { setup: "Why did the scarecrow win an award?", delivery: "Because he was outstanding in his field!" },
                { setup: "What do you call cheese that isn't yours?", delivery: "Nacho cheese!" },
            ];
            const j = LOCAL[Math.floor(Math.random() * LOCAL.length)];
            await sock.sendMessage(jid, {
                text: `😂 *JOKE*\n\n📢 ${j.setup}\n\n🎯 _${j.delivery}_\n\n_Nexus-1MD 🎤_`
            }, { quoted: msg });
        }
    }
};
