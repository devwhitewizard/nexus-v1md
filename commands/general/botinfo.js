const os = require("os");

module.exports = {
    name: "botinfo",
    aliases: ["info", "system"],
    description: "Check detailed bot info.",
    category: "general",
    execute: async ({ sock, jid }) => {
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        
        const info = `🤖 *NEXUS-1MD SYSTEM INFO*\n\n` +
                     `✨ *Version:* \`2.5.0 (Moderation)\`\n` +
                     `👨‍💻 *Developer:* \`White Wizard\`\n` +
                     `📂 *GitHub:* https://github.com/devwhitewizard/nexus-v1md\n` +
                     `🌐 *Portfolio:* https://jonathanmwanza.vercel.app/\n\n` +
                     `💻 *Platform:* \`${os.platform()}\`\n` +
                     `📟 *Memory:* \`${memory}MB / ${totalMem}GB\`\n` +
                     `🔋 *Node:* \`${process.version}\`\n\n` +
                     `_Nexus-1MD is a high-performance bot designed for professional group management._`;
        
        await sock.sendMessage(jid, { text: info });
    }
};
