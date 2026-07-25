const { getBotSettings, SettingsDB } = require("../../database/settings");

module.exports = {
    name: "unlock",
    description: "Unlock a previously locked command.",
    category: "owner",
    ownerOnly: true,
    async execute({ sock, jid, args, msg, commands }) {
        const cmdName = args[0]?.toLowerCase();
        if (!cmdName) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.unlock <command_name>`" });

        const settings = await getBotSettings();
        if (!settings.lockedCommands) return await sock.sendMessage(jid, { text: "ℹ️ No commands are currently locked." });

        let locked = settings.lockedCommands.split(",").map(c => c.trim());
        
        // Find canonical name
        const cmd = commands.get(cmdName) || [...commands.values()].find(c => c.aliases && c.aliases.includes(cmdName));
        const target = cmd ? cmd.name : cmdName;

        if (!locked.includes(target)) {
            return await sock.sendMessage(jid, { text: `ℹ️ \`.${target}\` is not locked.` });
        }

        locked = locked.filter(c => c !== target);
        await SettingsDB.update({ lockedCommands: locked.join(",") }, { where: { id: 1 } });

        await sock.sendMessage(jid, { text: `🔓 *Success:* The \`.${target}\` command has been unlocked for all users.` });
    }
};
