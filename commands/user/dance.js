module.exports = {
    name: "dance",
    description: "Make the bot dance",
    execute: async (ctx) => {
        await ctx.sock.sendMessage(ctx.jid, {
            text: "💃🕺 Let's dance!"
        });
    }
};
