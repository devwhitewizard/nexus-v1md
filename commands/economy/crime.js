const { getUser } = require("../../nexus/userModel");
const { getEffect } = require("../../lib/economy");

module.exports = {
    name: "crime",
    description: "Attempt a risky crime for big money.",
    category: "economy",
    execute: async ({ sock, jid, msg, sender }) => {
        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            const now = Date.now();
            const cooldown = 2 * 60 * 60 * 1000; // 2 hours

            if (user.lastCrime && (now - new Date(user.lastCrime).getTime() < cooldown)) {
                const remaining = cooldown - (now - new Date(user.lastCrime).getTime());
                const minutes = Math.floor(remaining / 60000);
                return await sock.sendMessage(jid, { text: `⏳ *Hide Out!* The police are looking for you. Wait \`${minutes}m\` before the next job.` }, { quoted: msg });
            }

            const inventory = JSON.parse(user.inventory || "[]");
            const successBoost = getEffect(inventory, "successBoost");
            
            const successChance = 0.45 + successBoost; // 45% base success
            const isSuccess = Math.random() < successChance;

            user.lastCrime = new Date(now);

            if (isSuccess) {
                const loot = Math.floor(Math.random() * 800) + 300;
                user.coins += loot;
                await user.save();
                await sock.sendMessage(jid, { 
                    text: `💰 *CRIME SUCCESS* 💰\n\nYou successfully pulled off the heist and got away with \`${loot}\` coins!\nNew balance: \`${user.coins}\` coins` 
                }, { quoted: msg });
            } else {
                const fine = Math.floor(Math.random() * 400) + 100;
                user.coins = Math.max(0, user.coins - fine);
                await user.save();
                await sock.sendMessage(jid, { 
                    text: `🚔 *BUSTED!* 🚔\n\nYou got caught by the police and was fined \`${fine}\` coins.\nNew balance: \`${user.coins}\` coins` 
                }, { quoted: msg });
            }

        } catch (err) {
            console.error("Crime error:", err);
            await sock.sendMessage(jid, { text: "❌ An error occurred during the crime." });
        }
    }
};
