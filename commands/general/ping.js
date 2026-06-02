module.exports = {
    name: "ping",
    execute: async (ctx) => {
        await ctx.sock.sendMessage(ctx.jid, { text: "pong 🏓" });
    }
};