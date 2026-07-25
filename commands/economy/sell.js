const { getUser } = require("../../nexus/userModel");
const { getItem } = require("../../lib/economy");

module.exports = {
    name: "sell",
    description: "Sell an item back to the shop.",
    category: "economy",
    execute: async ({ sock, jid, msg, sender, args }) => {
        const itemId = args[0]?.toLowerCase();
        if (!itemId) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.sell <item_id>`" });
        }

        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            let inventory = JSON.parse(user.inventory || "[]");
            
            const itemIndex = inventory.findIndex(i => i.id === itemId);
            if (itemIndex === -1) {
                return await sock.sendMessage(jid, { text: "❌ You don't own this item!" });
            }

            const item = getItem(itemId);
            if (!item) {
                // If item is removed from shop but user still has it, give a default refund
                const refund = 100;
                inventory.splice(itemIndex, 1);
                user.coins += refund;
                user.inventory = JSON.stringify(inventory);
                await user.save();
                return await sock.sendMessage(jid, { text: `✅ Sold unknown item for a refund of \`${refund}\` coins.` });
            }

            const refund = Math.floor(item.price * 0.5); // 50% refund
            inventory.splice(itemIndex, 1);
            user.coins += refund;
            user.inventory = JSON.stringify(inventory);
            
            await user.save();

            await sock.sendMessage(jid, { 
                text: `✅ *SALE SUCCESS*\n\nYou sold *${item.name}* back for \`${refund}\` coins!\nNew balance: \`${user.coins}\` coins` 
            }, { quoted: msg });

        } catch (err) {
            console.error("Sell error:", err);
            await sock.sendMessage(jid, { text: "❌ An error occurred while selling the item." });
        }
    }
};
