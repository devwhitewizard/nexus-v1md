const axios = require("axios");

const LOCAL_FACTS = [
    "Honey never spoils. Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.",
    "A group of flamingos is called a 'flamboyance'.",
    "Octopuses have three hearts, blue blood, and nine brains.",
    "Bananas are berries, but strawberries aren't.",
    "A day on Venus is longer than a year on Venus.",
    "The human nose can detect over 1 trillion different scents.",
    "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
    "The shortest war in history lasted only 38–45 minutes (Anglo-Zanzibar War, 1896).",
    "Wombats produce cube-shaped droppings — the only animal known to do so.",
    "A shrimp's heart is located in its head.",
    "Crows can recognise and remember human faces — and hold grudges.",
    "There are more possible chess game variations than atoms in the observable universe.",
    "The average cloud weighs around 500,000 kg.",
    "Sharks are older than trees by about 50 million years.",
    "Sea otters hold hands while sleeping to avoid drifting apart.",
];

module.exports = {
    name: "fact",
    aliases: ["facts", "funfact", "didfyouknow"],
    description: "Get a random interesting fact.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        let factText = "";

        try {
            const { data } = await axios.get(
                "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
                { timeout: 8000 }
            );
            factText = data.text;
        } catch {
            factText = LOCAL_FACTS[Math.floor(Math.random() * LOCAL_FACTS.length)];
        }

        await sock.sendMessage(jid, {
            text: `🧠 *RANDOM FACT*\n\n💡 ${factText}\n\n_Nexus-1MD Knowledge Drop_`
        }, { quoted: msg });
    }
};
