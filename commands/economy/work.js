const { getUser } = require("../../nexus/userModel");
const { getEffect } = require("../../lib/economy");

module.exports = {
    name: "work",
    description: "Work hard to earn some coins.",
    category: "economy",
    execute: async ({ sock, jid, msg, sender }) => {
        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            const now = Date.now();
            const cooldown = 60 * 60 * 1000; // 1 hour

            if (user.lastWork && (now - new Date(user.lastWork).getTime() < cooldown)) {
                const remaining = cooldown - (now - new Date(user.lastWork).getTime());
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                return await sock.sendMessage(jid, { text: `⏳ *Take a Break!* You're exhausted. Work again in: \`${minutes}m ${seconds}s\`` }, { quoted: msg });
            }

            const inventory = JSON.parse(user.inventory || "[]");
            const multiplier = 1 + getEffect(inventory, "multiplier");
            
            const baseEarning = Math.floor(Math.random() * 200) + 50;
            const totalEarning = Math.floor(baseEarning * multiplier);

            user.coins += totalEarning;
            user.lastWork = new Date(now);
            await user.save();

            const jobs = [
                "a software developer", "a delivery driver", "a chef", "a freelance artist",
                "a private investigator", "a professional gamer", "a gardener", "a barista"
            ];
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            await sock.sendMessage(jid, { 
                text: `💼 *WORK REPORT* 💼\n\nYou worked as *${job}* and earned: \`${totalEarning}\` coins!\n${multiplier > 1 ? `_(Bonus from tools included)_ \n` : ""}Your new balance: \`${user.coins}\` coins` 
            }, { quoted: msg });

        } catch (err) {
            console.error("Work error:", err);
            await sock.sendMessage(jid, { text: "❌ An error occurred while working." });
        }
    }
};
