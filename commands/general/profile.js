const { getUser } = require("../../lib/userModel");

module.exports = {
    name: "profile",
    description: "Show user info and stats.",
    category: "general",
    async execute({ sock, jid, msg, sender, args }) {
        const userJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] && args[0].includes("@") ? args[0] : sender);
        const user = await getUser(userJid);
        const pushName = (userJid === sender) ? (msg.pushName || "User") : "Member";

        const profileText = `👤 *USER PROFILE*\n\n` +
                            `🤠 *Name:* ${pushName}\n` +
                            `📞 *Number:* ${userJid.split("@")[0]}\n\n` +
                            `📈 *Level:* ${user.level}\n` +
                            `✨ *XP:* ${user.xp}\n` +
                            `💰 *Balance:* ${user.coins} coins\n\n` +
                            `_Nexus-1MD • Premium User Status_`;

        await sock.sendMessage(jid, { 
            text: profileText,
            mentions: [userJid],
            contextInfo: {
                externalAdReply: {
                    title: `${pushName}'s Stats`,
                    body: "Nexus Economy System",
                    thumbnailUrl: "https://files.catbox.moe/p9pntu.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};