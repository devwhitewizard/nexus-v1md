const { getUser } = require("../../nexus/userModel");

module.exports = {
    name: "balance",
    aliases: ["coins", "cash"],
    description: "Check your virtual money.",
    category: "general",
    async execute({ sock, jid, msg, sender }) {
        const user = await getUser(sender);
        await sock.sendMessage(jid, { 
            text: `💰 *WALLET BALANCE*\n\nYou currently have: \`${user.coins}\` coins\n\n_Use .daily to earn more!_` 
        }, { quoted: msg });
    }
};
