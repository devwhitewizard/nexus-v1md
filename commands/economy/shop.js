const { items } = require("../../lib/economy");

module.exports = {
    name: "shop",
    aliases: ["store", "market"],
    description: "View items available for purchase.",
    category: "economy",
    execute: async ({ sock, jid, msg }) => {
        let shopList = `🏪 *NEXUS MARKET* 🏪\n\n`;
        
        items.forEach((item, index) => {
            shopList += `${index + 1}. *${item.name}*\n`;
            shopList += `   💰 Price: \`${item.price}\` coins\n`;
            shopList += `   📝 ${item.description}\n`;
            shopList += `   🆔 ID: \`${item.id}\`\n\n`;
        });

        shopList += `💎 _Buy items using .buy <item_id>_`;
        
        await sock.sendMessage(jid, { text: shopList }, { quoted: msg });
    }
};
