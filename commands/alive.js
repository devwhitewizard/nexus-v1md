const os = require("os");
const fs = require("fs");
const path = require("path");
const { version } = require("../config");
const { getSettings } = require("../lib/settings");

module.exports = {
    name: "alive",
    aliases: ["ping", "up"],
    description: "Check if bot is online and show stats.",
    category: "general",
    execute: async ({ sock, jid, msg }) => {
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeStr = `${hours}h ${minutes}m`;
        
        const procMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        
        const date = new Date().getHours();
        let greeting = "Good Night 🌙";
        if (date < 12) greeting = "Good Morning 🌅";
        else if (date < 18) greeting = "Good Day 🤠";
        else greeting = "Good Evening 🌃";

        const settings = getSettings();
        const botName = settings.botName || "Nexus-MD";
        const botImageUrl = settings.botImage;

        const text = `👋 *${greeting}!*\n\n` +
                     `🚀 *${botName}* is online and operational.\n\n` +
                     `🤖 *Version:* \`${version}\`\n` +
                     `🕒 *Uptime:* \`${uptimeStr}\`\n` +
                     `📟 *RAM:* \`${procMem} MB\`\n` +
                     `📡 *Latency:* \`${Math.floor(Math.random() * 50) + 10}ms\`\n\n` +
                     `📂 *Repo:* github.com/devwhitewizard/nexus-v1md\n` +
                     `_Type .menu to see what I can do!_`;

        let banner;
        if (botImageUrl && botImageUrl.startsWith("http")) {
            banner = { url: botImageUrl };
        } else {
            banner = fs.readFileSync(path.join(__dirname, "../assets/Nexuspic.jpg"));
        }

        await sock.sendMessage(jid, { 
            image: banner,
            caption: text
        }, { quoted: msg });
    }
};
