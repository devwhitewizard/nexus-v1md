const { getBotSettings, SettingsDB } = require("../../database/settings");

module.exports = {
    name: "lock",
    description: "Lock a command for everyone except owners.",
    category: "owner",
    ownerOnly: true,
    async execute({ sock, jid, args, msg, commands }) {
        const cmdName = args[0]?.toLowerCase();
        if (!cmdName) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.lock <command_name>`" });

        // Find the command to make sure it exists
        const cmd = commands.get(cmdName) || [...commands.values()].find(c => c.aliases && c.aliases.includes(cmdName));
        if (!cmd) return await sock.sendMessage(jid, { text: `❌ *Error:* Command \`.${cmdName}\` not found.` });

        const settings = await getBotSettings();
        let locked = settings.lockedCommands ? settings.lockedCommands.split(",").map(c => c.trim()) : [];
        
        if (locked.includes(cmd.name)) {
            return await sock.sendMessage(jid, { text: `✅ \`.${cmd.name}\` is already locked.` });
        }

        locked.push(cmd.name);
        await SettingsDB.update({ lockedCommands: locked.join(",") }, { where: { id: 1 } });

        await sock.sendMessage(jid, { text: `🔒 *Success:* The \`.${cmd.name}\` command has been locked for all users except owners.` });
    }
};
