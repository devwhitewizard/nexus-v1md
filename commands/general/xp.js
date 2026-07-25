const { getUser } = require("../../nexus/userModel");

module.exports = {
    name: "xp",
    description: "Check your experience and level.",
    category: "general",
    async execute({ sock, jid, msg, sender }) {
        const user = await getUser(sender);
        const nextLevel = user.level * 100;
        const progress = Math.floor((user.xp / nextLevel) * 100);
        
        const xpText = `✨ *LEVELING STATUS*\n\n` +
                       `🏅 *Level:* ${user.level}\n` +
                       `📈 *XP:* ${user.xp}\n` +
                       `📊 *Progress:* ${progress}% to next level\n\n` +
                       `_Keep chatting to earn more!_`;
                       
        await sock.sendMessage(jid, { text: xpText }, { quoted: msg });
    }
};
