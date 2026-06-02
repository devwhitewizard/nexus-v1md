module.exports = {
    name: "admin",

    middlewares: [
        async (ctx, { isAdmin }) => {
            if (!isAdmin(ctx.sender)) {
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