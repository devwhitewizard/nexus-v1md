module.exports = {
    name: "hello",
    description: "Say hello to the bot",
    execute: async (ctx) => {
        await ctx.sock.sendMessage(ctx.jid, {
            text: "Hello too,How can i help you today?"
        });
    }
};