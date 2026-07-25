const { getUser } = require("../../nexus/userModel");

module.exports = {
    name: "inventory",
    aliases: ["inv", "items"],
    description: "View your owned items.",
    category: "economy",
    execute: async ({ sock, jid, msg, sender }) => {
        try {
            const user = await getUser(sender);
            if (!user) throw new Error("Could not load user profile.");
            const inventory = JSON.parse(user.inventory || "[]");

            if (inventory.length === 0) {
                return await sock.sendMessage(jid, { text: "🎒 *Your inventory is empty!*" }, { quoted: msg });
            }

            let invList = `🎒 *YOUR INVENTORY* 🎒\n\n`;
            inventory.forEach((item, index) => {
                invList += `${index + 1}. *${item.name}*\n`;
                invList += `   🆔 ID: \`${item.id}\`\n\n`;
            });

            invList += `💰 *Credit Balance:* \`${user.coins}\` coins`;
            
            await sock.sendMessage(jid, { text: invList }, { quoted: msg });

        } catch (err) {
            console.error("Inventory error:", err);
            await sock.sendMessage(jid, { text: "❌ An error occurred while loading your inventory." });
        }
    }
};
