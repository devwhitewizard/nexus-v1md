const { getUser } = require("../../lib/userModel");
const { getItem } = require("../../lib/economy");

module.exports = {
    name: "buy",
    aliases: ["purchase"],
    description: "Buy an item from the shop.",
    category: "economy",
    execute: async ({ sock, jid, msg, sender, args }) => {
        const itemId = args[0]?.toLowerCase();
        if (!itemId) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.buy <item_id>`\n\nExample: `.buy pickaxe`" });
        }

        const item = getItem(itemId);
        if (!item) {
            return await sock.sendMessage(jid, { text: "❌ Item not found in shop!" });
        }

        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            
            if (user.coins < item.price) {
                return await sock.sendMessage(jid, { text: `💸 *Insufficient Funds!* You need \`${item.price - user.coins}\` more coins to buy this.` });
            }

            const inventory = JSON.parse(user.inventory || "[]");
            
            // Check if user already owns the item
            if (inventory.some(i => i.id === item.id)) {
                return await sock.sendMessage(jid, { text: `📦 You already own *${item.name}*!` });
            }

            // Deduct coins and add to inventory
            user.coins -= item.price;
            inventory.push({ id: item.id, name: item.name, date: new Date() });
            user.inventory = JSON.stringify(inventory);
            
            await user.save();

            await sock.sendMessage(jid, { 
                text: `✅ *PURCHASE SUCCESS*\n\nYou bought *${item.name}* for \`${item.price}\` coins!\nRemaining balance: \`${user.coins}\` coins` 
            }, { quoted: msg });

        } catch (err) {
            console.error("Buy error:", err);
            await sock.sendMessage(jid, { text: "❌ An error occurred while purchasing the item." });
        }
    }
};
