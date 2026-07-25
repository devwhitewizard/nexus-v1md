module.exports = {
    name: "getdesc",
    description: "Get description of a command",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg, commands } = ctx;
        const target = args[0]?.toLowerCase();

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.getdesc <command_name>`" }, { quoted: msg });
        }

        const cmd = commands.get(target);
        if (!cmd) {
            return await sock.sendMessage(jid, { text: `❌ Command \`.${target}\` not found.` }, { quoted: msg });
        }

        const desc = cmd.description || "No description provided for this command.";
        await sock.sendMessage(jid, { text: `📝 *Command:* \`.${cmd.name}\`\n📖 *Description:* ${desc}` }, { quoted: msg });
    }
};
