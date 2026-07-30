module.exports = {
    name: "getdesc",
    aliases: ["desc", "cmdinfo"],
    description: "Get description and details of a command",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg, commands } = ctx;
        const target = args[0]?.toLowerCase().replace(/^\./, "");

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.getdesc <command_name>` (e.g. `.getdesc ping` or `.desc ai`)" }, { quoted: msg });
        }

        const cmd = commands.get(target);
        if (!cmd) {
            return await sock.sendMessage(jid, { text: `❌ Command \`.${target}\` not found.` }, { quoted: msg });
        }

        let info = `╭━━━━╼ *COMMAND DETAILS* ╾━━━━╮\n`;
        info += `┃\n`;
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
