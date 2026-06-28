module.exports = {
    name: "admin",

    middlewares: [
        async (ctx, { isAdmin }) => {
            if (!await isAdmin(ctx.sender, ctx.jid, ctx.sock)) {
                return { ok: false, reply: "❌ This command is admin-only" };
            }
            return { ok: true };
        }
    ],

    execute: async (ctx) => {
        await ctx.sock.sendMessage(ctx.jid, {
            text: "🔐 Admin command executed!"
        });
    }
};