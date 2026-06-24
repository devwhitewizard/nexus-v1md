const { commands } = require("../lib/commandHandler");

module.exports = {
    name: "getalias",
    aliases: ["getaliases"],
    description: "Get aliases of a command",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const target = args[0]?.toLowerCase();

        if (!target) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.getalias <command_name>`" }, { quoted: msg });
        }

        const cmd = commands.get(target);
        if (!cmd) {
            return await sock.sendMessage(jid, { text: `❌ Command \`.${target}\` not found.` }, { quoted: msg });
        }

        const aliases = (cmd.aliases && cmd.aliases.length > 0) 
            ? cmd.aliases.map(a => `\`.${a}\``).join(", ") 
            : "No aliases defined.";
        
        await sock.sendMessage(jid, { text: `📝 *Command:* \`.${cmd.name}\`\n🔗 *Aliases:* ${aliases}` }, { quoted: msg });
    }
};
