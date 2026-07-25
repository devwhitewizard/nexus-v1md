module.exports = {
    name: "group",
    aliases: ["open", "close", "lock", "unlock"],
    description: "Manage group settings (open/close).",
    category: "group",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg, text }) {
        const cmdName = text.split(/\s+/)[0].slice(1).toLowerCase(); // get the name used (group, open, close, etc)
        let action = args[0]?.toLowerCase();

        // Handle direct aliases
        if (cmdName === "open" || cmdName === "unlock") action = "open";
        if (cmdName === "close" || cmdName === "lock") action = "close";
        
        if (action === "open" || action === "unlock") {
            await sock.groupSettingUpdate(jid, "not_announcement");
            await sock.sendMessage(jid, { text: "🔓 *Group Opened:* All members can now send messages." });
        } else if (action === "close" || action === "lock") {
            await sock.groupSettingUpdate(jid, "announcement");
            await sock.sendMessage(jid, { text: "🔒 *Group Closed:* Only admins can now send messages." });
        } else {
            await sock.sendMessage(jid, { text: "❓ *Usage:* `.group open` or `.group close`" });
        }
    }
};
