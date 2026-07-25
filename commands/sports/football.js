module.exports = {
    name: "football",
    aliases: ["soccer"],
    description: "Get random football facts and info.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        const facts = [
            "The first game of basketball was played with a soccer ball.",
            "A soccer ball is made up of 32 leather panels.",
            "The World Cup is the most-watched sports event in the world.",
            "Cristiano Ronaldo is the first player to score in 5 different World Cups.",
            "Pele is the youngest player to score in a World Cup final at age 17."
        ];
        const fact = facts[Math.floor(Math.random() * facts.length)];
        await sock.sendMessage(jid, { text: `⚽ *FOOTBALL FACT:* \n\n${fact}` }, { quoted: msg });
    }
};
