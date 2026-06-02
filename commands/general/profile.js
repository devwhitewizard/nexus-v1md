const { getUser } = require("../../lib/userModel");

module.exports = {
    name: "profile",

    execute: async (sock, ctx) => {

        const user = await getUser(ctx.sender);

        await sock.sendMessage(ctx.jid, {
            text:
`👤 Profile

ID: ${ctx.sender}
XP: ${user.xp}
Level: ${user.level}
Coins: ${user.coins}`
        });

    }
};