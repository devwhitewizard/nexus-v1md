module.exports = {
    name: "groupjid",
    aliases: ["gjid"],
    description: "Get the JID of the current group chat",
    category: "group",
    groupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;
        await sock.sendMessage(jid, { text: `🆔 *Group JID:* \`${jid}\`` }, { quoted: msg });
    }
};
