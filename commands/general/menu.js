const path = require("path");
const fs = require("fs");

module.exports = {
    name: "menu",
    aliases: ["help"],
    description: "Display interactive command menu",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, commands } = ctx;
        const vname = ctx.msg.pushName || "User";

        try {
            // 🟢 Sub-menu logic (If user selected a category)
            if (args.length > 0) {
                const targetCategory = args[0].toLowerCase();
                const categoryCommands = [...commands.values()].filter(cmd => 
                    cmd.category && cmd.category.toLowerCase() === targetCategory
                );

                if (categoryCommands.length > 0) {
                    let subMenuText = `┏━━━◇ *${targetCategory.toUpperCase()}* ◇━━━┓\n\n`;
                    // Remove duplicates (from aliases)
                    const uniqueCmds = [...new Map(categoryCommands.map(item => [item.name, item])).values()];
                    
                    uniqueCmds.forEach((cmd, i) => {
                        subMenuText += `${i + 1}. *${cmd.name}*\n   _${cmd.description || 'No description'}_\n\n`;
                    });
                    subMenuText += `┗━━━━━━━━━━━━━━━◇`;
                    return await sock.sendMessage(jid, { text: subMenuText });
                }
            }

            // 🔵 Main Menu logic
            const bannerPath = path.join(__dirname, "../../assets/Nexuspic.png");
            
            // List Sections
            const categories = [
                { title: "OWNER & ADMIN", rows: [
                    { title: "📢 Owner Menu", rowId: ".menu owner", description: "Secure owner-only commands" },
                    { title: "👥 Admin Menu", rowId: ".menu admin", description: "Admin group controls" }
                ]},
                { title: "FEATURES", rows: [
                    { title: "🤖 AI Menu", rowId: ".menu ai", description: "Chat GPT & Image generation" },
                    { title: "📥 Downloader", rowId: ".menu download", description: "Media downloaders" },
                    { title: "👥 Group Menu", rowId: ".menu group", description: "Group management" }
                ]},
                { title: "UTILS", rows: [
                    { title: "🎨 Sticker", rowId: ".menu sticker", description: "Create stickers" },
                    { title: "🌍 General", rowId: ".menu general", description: "Standard commands" }
                ]}
            ];

            let menuText = `*NEXUS-1MD MENU*\n\nHello *${vname}*! 👋\nClick 'SELECT CATEGORY' to see available commands.`;

            const listMessage = {
                text: menuText,
                footer: "Powered by Nexus-1MD",
                title: "🌟 MAIN MENU",
                buttonText: "SELECT CATEGORY",
                sections: categories
            };

            if (fs.existsSync(bannerPath)) {
                await sock.sendMessage(jid, {
                    image: fs.readFileSync(bannerPath),
                    caption: menuText,
                    footer: "Select a category below",
                    viewOnce: true
                });
                return await sock.sendMessage(jid, listMessage);
            } else {
                return await sock.sendMessage(jid, listMessage);
            }

        } catch (error) {
            console.error("❌ Menu Exception:", error);
            await sock.sendMessage(jid, { text: "⚠️ Error showing menu. Try .menu general" });
        }
    }
};
