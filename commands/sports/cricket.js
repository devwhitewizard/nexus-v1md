module.exports = {
    name: "cricket",
    description: "Get random cricket facts and info.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        const facts = [
            "The first international cricket match was played between the USA and Canada in 1844.",
            "Sachin Tendulkar is the first player to score 100 international centuries.",
            "The shortest cricket match lasted only 10 minutes.",
            "Chris Gayle is the only player to hit a six on the first ball of a Test match.",
            "The highest score in a single IPL inning is 175 by Chris Gayle."
        ];
        const fact = facts[Math.floor(Math.random() * facts.length)];
        await sock.sendMessage(jid, { text: `🏏 *CRICKET FACT:* \n\n${fact}` }, { quoted: msg });
    }
};
