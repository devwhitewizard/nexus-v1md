module.exports = {
    name: "gcdesc",
    aliases: ["setdesc"],
    description: "Updates the group description.",
    category: "group",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args }) {
        const desc = args.join(" ");
        if (!desc) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.setdesc <new description text>`" });

        try {
            await sock.groupUpdateDescription(jid, desc);
            await sock.sendMessage(jid, { text: "✅ *Description Updated:* The group description has been changed." });
        } catch (err) {
            console.error("Setdesc error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to update description." });
        }
    }
};
