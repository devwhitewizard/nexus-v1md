module.exports = {
    name: "getcategory",
    description: "Get the category of a command",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg, commands } = ctx;
        const target = args[0]?.toLowerCase();

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.getcategory <command_name>`" }, { quoted: msg });
        }

        const cmd = commands.get(target);
        if (!cmd) {
            return await sock.sendMessage(jid, { text: `❌ Command \`.${target}\` not found.` }, { quoted: msg });
        }

        const cat = cmd.category || "general";
        await sock.sendMessage(jid, { text: `📝 *Command:* \`.${cmd.name}\`\n📂 *Category:* ${cat.toUpperCase()}` }, { quoted: msg });
    }
};
