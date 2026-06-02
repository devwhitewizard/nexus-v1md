// Category: owner
// Access: owner only
// Usage: .botinfo

const { version, ownerNumber } = require("../../config");

module.exports = {
    name: "botinfo",
    description: "Show bot status and owner info",
    category: "owner",
   // isAdminOnly: true, // TEMPORARILY DISABLED FOR DEBUGGING
    cooldown: 5000,

    execute: async (ctx) => {
        try {
            console.log(`🛠️ BotInfo: Starting execution for sender: ${ctx.sender}`);
            const uptime = process.uptime();
            const hrs  = Math.floor(uptime / 3600);
            const mins = Math.floor((uptime % 3600) / 60);
            const secs = Math.floor(uptime % 60);

            const mem = process.memoryUsage();
            const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(1);

            const info = [
                `🤖 *Nexus Bot v${version} — Owner Dashboard*`,
                ``,
                `👤 Owner  : ${ownerNumber}`,
                `⏱️  Uptime : ${hrs}h ${mins}m ${secs}s`,
                `🧠 Heap   : ${heapMB} MB`,
                `🟢 Status : Online`,
            ].join("\n");

            console.log("🛠️ BotInfo: Sending message...");
            await ctx.sock.sendMessage(ctx.jid, { text: info });
            console.log("✅ BotInfo: Execution complete!");
        } catch (err) {
            console.error("❌ BotInfo Error:", err);
            await ctx.sock.sendMessage(ctx.jid, { text: `⚠️ BotInfo Crash: ${err.message}` });
        }
    }
};
