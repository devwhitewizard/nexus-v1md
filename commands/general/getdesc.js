module.exports = {
    name: "getdesc",
    aliases: ["desc", "cmdinfo"],
    description: "Get description of a command or list all commands in a category",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg, commands } = ctx;
        const target = args[0]?.toLowerCase().replace(/^\./, "");

        if (!target) {
            return await sock.sendMessage(jid, {
                text: "⚠️ Usage:\n" +
                    "• `.getdesc <command>` — details of one command\n" +
                    "• `.getdesc <category>` — list all commands in a category\n\n" +
                    "*Examples:*\n▸ `.getdesc ping`\n▸ `.getdesc general`\n▸ `.desc ai`"
            }, { quoted: msg });
        }

        // ── Build a deduplicated list ──────────────────────────────────────────
        const allCommands = [...new Map([...commands.entries()].map(([, v]) => [v.name, v])).values()];

        // ① Check if target is a category
        const catCmds = allCommands.filter(c => (c.category || "general").toLowerCase() === target);
        if (catCmds.length > 0) {
            catCmds.sort((a, b) => a.name.localeCompare(b.name));
            let info = `╭━━━━╼ *${target.toUpperCase()} COMMANDS* ╾━━━━╮\n┃\n`;
            for (const cmd of catCmds) {
                info += `┃ 🔹 *.${cmd.name}*`;
                if (cmd.description) info += ` — ${cmd.description}`;
                info += "\n";
            }
            info += `┃\n┃ 📊 *Total:* ${catCmds.length} command${catCmds.length !== 1 ? "s" : ""}\n`;
            info += `╰━━━━━━━━━━━━━━━━━━━━╯`;
            return await sock.sendMessage(jid, { text: info }, { quoted: msg });
        }

        // ② Check if target is a specific command or alias
        const cmd = commands.get(target);
        if (!cmd) {
            return await sock.sendMessage(jid, {
                text: `❌ *"${target}"* is not a known command or category.\n\n💡 Try *.getdesc general* or *.getdesc ping*`
            }, { quoted: msg });
        }

        let info = `╭━━━━╼ *COMMAND DETAILS* ╾━━━━╮\n┃\n`;
        info += `┃ 🔹 *Command:* .${cmd.name}\n`;
        info += `┃ 📝 *Description:* ${cmd.description || "No description provided."}\n`;
        if (cmd.category) info += `┃ 🏷️ *Category:* ${cmd.category.toUpperCase()}\n`;
        if (cmd.aliases && cmd.aliases.length > 0) {
            info += `┃ 🔤 *Aliases:* ${cmd.aliases.map(a => `.${a}`).join(", ")}\n`;
        }
        if (cmd.isOwnerOnly) info += `┃ 🔒 *Permission:* Owner Only\n`;
        else if (cmd.isAdminOnly) info += `┃ 🛡️ *Permission:* Admin Only\n`;
        else if (cmd.isGroupOnly) info += `┃ 👥 *Permission:* Group Only\n`;
        info += `┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(jid, { text: info }, { quoted: msg });
    }
};
