const { ownerNumbers, admins } = require("../config");
const { toJid } = require("./utils");

const isSudo = (sender) => {
    if (!sender || !process.env.SUDO) return false;
    const senderDigits = sender.replace(/\D/g, "");
    const sudoDigits = process.env.SUDO.replace(/\D/g, "");
    return sudoDigits && senderDigits.includes(sudoDigits);
};

const isOwner = (sender) => {
    if (!sender) return false;
    if (isSudo(sender)) return true; // Sudo is Super-Owner

    const senderDigits = sender.replace(/\D/g, "");
    if (!senderDigits) return false;

    // 🛡️ 1. Check if it matches the 'SELF' digits captured during connection
    if (global.myJid) {
        const botDigits = global.myJid.replace(/\D/g, "");
        if (senderDigits === botDigits) return true;
    }

    // 🛡️ 2. Check the hardcoded and .env owners list
    const isMatched = ownerNumbers.some(num => {
        const ownerDigits = num.replace(/\D/g, "");
        return ownerDigits && senderDigits.includes(ownerDigits);
    });

    return isMatched || false;
};

const isAdmin = (sender) => {
    return admins.some(admin => admin.split("@")[0] === sender.split("@")[0]) || isOwner(sender);
};

// Simplified middleware runners/builders
const Middlewares = {
    sudoOnly: async (ctx) => {
        if (!isSudo(ctx.sender)) return { ok: false, reply: "🔒 *Strict Security:* This command is restricted to the Super-Admin (SUDO) only." };
        return { ok: true };
    },
    ownerOnly: async (ctx) => {
        if (!isOwner(ctx.sender)) return { ok: false, reply: "❌ This command is for the bot owner only." };
        return { ok: true };
    },
    adminOnly: async (ctx) => {
        if (!isAdmin(ctx.sender)) return { ok: false, reply: "❌ This command is for admins only." };
        return { ok: true };
    },
    groupOnly: async (ctx) => {
        if (!ctx.isGroup) return { ok: false, reply: "⚠️ This command can only be used in a group." };
        return { ok: true };
    }
};

async function runMiddleware(ctx, command) {
    // 1. Automatic flags check
    const sudoCheck = command.isSudoOnly || command.sudoOnly;
    const ownerCheck = command.isOwnerOnly || command.ownerOnly;
    const adminCheck = command.isAdminOnly || command.adminOnly;
    const groupCheck = command.isGroupOnly || command.groupOnly;

    if (sudoCheck && !isSudo(ctx.sender)) {
        console.log(`🚫 Middleware: Blocked ${ctx.sender} from Sudo-only command ${command.name}`);
        await ctx.sock.sendMessage(ctx.jid, { text: "🔒 *Security Denied:* This command is restricted to the Super-Admin (SUDO) as defined in .env." });
        return false;
    }
    if (ownerCheck && !isOwner(ctx.sender)) {
        console.log(`🚫 Middleware: Blocked ${ctx.sender} from Owner-only command ${command.name}`);
        await ctx.sock.sendMessage(ctx.jid, { text: "❌ *Access Denied:* This command is restricted to the bot owner only." });
        return false;
    }
    if (adminCheck && !isAdmin(ctx.sender)) {
        console.log(`🚫 Middleware: Blocked ${ctx.sender} from Admin-only command ${command.name}`);
        await ctx.sock.sendMessage(ctx.jid, { text: "❌ *Access Denied:* This command is restricted to group admins only." });
        return false;
    }
    if (groupCheck && !ctx.isGroup) {
        console.log(`🚫 Middleware: Blocked ${ctx.sender} from Group-only command ${command.name}`);
        await ctx.sock.sendMessage(ctx.jid, { text: "⚠️ *Group Only:* Use this command inside a group!" });
        return false;
    }

    // 2. Custom middlewares array
    if (command.middlewares && Array.isArray(command.middlewares)) {
        for (const middleware of command.middlewares) {
            const result = await middleware(ctx, { isOwner, isAdmin, isSudo });
            if (result && result.ok === false) {
                if (result.reply) await ctx.sock.sendMessage(ctx.jid, { text: result.reply });
                return false;
            }
        }
    }
    return true;
}

module.exports = { runMiddleware, isOwner, isAdmin, isSudo, Middlewares };