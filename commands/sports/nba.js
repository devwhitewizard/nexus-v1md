module.exports = {
    name: "nba",
    aliases: ["basketball"],
    description: "Get random NBA/Basketball facts and info.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        const facts = [
            "Wilt Chamberlain once scored 100 points in a single game.",
            "The NBA was founded in 1946 (as the BAA).",
            "Muggsy Bogues was the shortest player in NBA history at 5'3\".",
            "LeBron James is the all-time leading scorer in NBA history.",
            "The Boston Celtics have won the most NBA championships."
        ];
        const fact = facts[Math.floor(Math.random() * facts.length)];
        await sock.sendMessage(jid, { text: `🏀 *NBA FACT:* \n\n${fact}` }, { quoted: msg });
    }
};
