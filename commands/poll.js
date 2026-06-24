module.exports = {
    name: "poll",
    aliases: ["createpoll"],
    description: "Create and send a poll to the group chat",
    category: "group",
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const input = args.join(" ");

        if (!input || !input.includes("|")) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:* `.poll Question | Option 1 | Option 2 [| Option 3 ...]`\n\n*Example:*\n▸ `.poll What is your favorite food? | Pizza | Burger | Sushi`" 
            }, { quoted: msg });
        }

        const parts = input.split("|");
        const question = parts[0].trim();
        const options = parts.slice(1).map(o => o.trim()).filter(o => o.length > 0);

        if (options.length < 2) {
            return await sock.sendMessage(jid, { text: "⚠️ You must provide at least 2 options for the poll." }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            });
        } catch (error) {
            console.error("❌ Poll Command Error:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to send poll." }, { quoted: msg });
        }
    }
};
