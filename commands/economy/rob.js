const { getUser } = require("../../lib/userModel");
const { getEffect } = require("../../lib/economy");

module.exports = {
    name: "rob",
    description: "Try to steal money from another user.",
    category: "economy",
    execute: async ({ sock, jid, msg, sender, args }) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.rob @user`" });
        }

        if (mentioned === sender) {
            return await sock.sendMessage(jid, { text: "🤡 You can't rob yourself." });
        }

        try {
            const victim = await getUser(mentioned);
            const robber = await getUser(sender);

            if (!victim || !robber) throw new Error("Could not load profiles.");

            if (!victim || victim.coins < 100) {
                return await sock.sendMessage(jid, { text: "🏦 This user is too poor to rob!" });
            }

            const now = Date.now();
            const cooldown = 4 * 60 * 60 * 1000; // 4 hours

            if (robber.lastRob && (now - new Date(robber.lastRob).getTime() < cooldown)) {
                const remaining = cooldown - (now - new Date(robber.lastRob).getTime());
                const minutes = Math.floor(remaining / 60000);
                return await sock.sendMessage(jid, { text: `⏳ *Wait!* You need to lay low. Rob again in \`${minutes}m\`.` }, { quoted: msg });
            }

            const robberInventory = JSON.parse(robber.inventory || "[]");
            const victimInventory = JSON.parse(victim.inventory || "[]");

            const robProtection = getEffect(robberInventory, "robProtection"); // Helps robber not get caught
            const victimDefense = getEffect(victimInventory, "protection"); // Protects victim's money

            const successChance = 0.4 + robProtection; // 40% base
            const isSuccess = Math.random() < successChance;

            robber.lastRob = new Date(now);

            if (isSuccess) {
                // Steal between 10% and 30% of their cash
                const percentage = (Math.random() * 0.2) + 0.1;
                let stolen = Math.floor(victim.coins * percentage);
                
                // Victim's shield protection
                const saved = Math.floor(stolen * victimDefense);
                stolen -= saved;

                victim.coins -= stolen;
                robber.coins += stolen;

                await victim.save();
                await robber.save();

                await sock.sendMessage(jid, { 
                    text: `🥷 *ROBBERY SUCCESS* 🥷\n\nYou robbed @${mentioned.split("@")[0]} and got away with \`${stolen}\` coins!${saved > 0 ? `\n_(They saved ${saved} coins using a shield!)_` : ""}`,
                    mentions: [mentioned]
                }, { quoted: msg });
            } else {
                const penalty = Math.floor(robber.coins * 0.1);
                robber.coins -= penalty;
                await robber.save();
                await sock.sendMessage(jid, { 
                    text: `🚔 *CAUGHT!* 🚔\n\n@${sender.split("@")[0]} was caught trying to rob @${mentioned.split("@")[0]} and was fined \`${penalty}\` coins!`,
                    mentions: [sender, mentioned]
                }, { quoted: msg });
            }

        } catch (err) {
            console.error("❌ Rob error:", err);
            await sock.sendMessage(jid, { text: `❌ *Error:* ${err.message || "An error occurred while robbing."}` });
        }
    }
};
