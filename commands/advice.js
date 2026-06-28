const axios = require("axios");

const LOCAL_ADVICES = [
    "Remember that failure is an event, not a person. 🌟",
    "Speak less than you know; have more than you show. 🤫",
    "Be kind to yourself. You are doing the best you can. 💛",
    "If you want to go fast, go alone. If you want to go far, go together. 🤝",
    "Don't cross a bridge until you come to it. 🌉",
    "Action expresses priorities. Take care of what matters first. 🎯",
    "The best way to predict the future is to create it. 🚀",
    "You don't have to control everything. Some things just need to happen. 🍃",
    "Your life is your story. Write it well. Edit often. 📝",
    "Never make permanent decisions on temporary emotions. 🌊"
];

module.exports = {
    name: "advice",
    aliases: ["getadvice", "advise"],
    description: "Get a random piece of life advice.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        let adviceText = "";

        try {
            const { data } = await axios.get(
                "https://api.adviceslip.com/advice",
                { timeout: 8000 }
            );
            if (data?.slip?.advice) {
                adviceText = data.slip.advice;
            } else {
                throw new Error("Invalid API response");
            }
        } catch {
            adviceText = LOCAL_ADVICES[Math.floor(Math.random() * LOCAL_ADVICES.length)];
        }

        await sock.sendMessage(jid, {
            text: `💡 *NEXUS ADVICE SLIP*\n\n✨ _"${adviceText}"_\n\n_Stay wise • Nexus-1MD_`
        }, { quoted: msg });
    }
};
