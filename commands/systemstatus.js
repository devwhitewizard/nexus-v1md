const os = require("os");

module.exports = {
    name: "status",
    aliases: ["systemstatus", "health", "sysinfo", "!status", "system", "systeminfo"],
    description: "Check bot health, uptime, and memory usage.",
    category: "system",
    execute: async ({ sock, jid, msg }) => {
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // GB
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2); // GB
        const usedMem = (totalMem - freeMem).toFixed(2);
        
        const procMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2); // MB

        const statusText = 
            `🛰️ *NEXUS SYSTEM STATUS*\n\n` +
            `🟢 *Status:* Healthy\n` +
            `🕒 *Uptime:* \`${uptimeStr}\`\n\n` +
            `💻 *OS:* ${os.platform()} ${os.release()}\n` +
            `🧠 *Server RAM:* \`${usedMem}GB / ${totalMem}GB\`\n` +
            `📟 *Process RAM:* \`${procMem}MB\`\n` +
            `🤖 *NodeJS:* ${process.version}\n\n` +
            `🏠 *Host:* ${os.hostname()}\n` +
            `⛓️ *Baileys:* @whiskeysockets/baileys\n\n` +
            `_Nexus-1MD Core Engine_`;

        await sock.sendMessage(jid, { text: statusText }, { quoted: msg });
    }
};
