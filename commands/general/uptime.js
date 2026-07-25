module.exports = {
    name: "uptime",
    aliases: ["runtime"],
    description: "Check bot online duration.",
    category: "general",
    execute: async ({ sock, jid }) => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const text = `🕒 *NEXUS UPTIME*\n\nOnline for: \`${hours}h ${minutes}m ${seconds}s\``;
        await sock.sendMessage(jid, { text });
    }
};
