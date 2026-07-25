// Category: group
// Access: any member (group only)
// Usage: .groupinfo

module.exports = {
    name: "groupinfo",
    description: "Show info about this group",
    category: "group",
    cooldown: 5000,

    middlewares: [
        async (ctx) => {
            if (!ctx.isGroup) {
                return { ok: false, reply: "⚠️ This command can only be used inside a group." };
            }
            return { ok: true };
        }
    ],

    execute: async (ctx) => {
        const meta = await ctx.sock.groupMetadata(ctx.jid);

        const created = new Date(meta.creation * 1000).toLocaleDateString("en-KE", {
            year: "numeric", month: "long", day: "numeric"
        });

        const admins = meta.participants
            .filter((p) => p.admin)
            .map((p) => `  • @${p.id.split("@")[0]}`)
            .join("\n");

        const info = [
            `👥 *Group Info*`,
            ``,
            `📛 Name    : ${meta.subject}`,
            `🆔 JID     : ${ctx.jid}`,
            `📅 Created : ${created}`,
            `👤 Members : ${meta.participants.length}`,
            `🛡️  Admins  :`,
            admins || "  (none found)",
            ``,
            meta.desc ? `📋 Desc: ${meta.desc}` : "",
        ].filter(Boolean).join("\n");

        await ctx.sock.sendMessage(ctx.jid, {
            text: info,
            mentions: meta.participants.filter((p) => p.admin).map((p) => p.id),
        });
    }
};
