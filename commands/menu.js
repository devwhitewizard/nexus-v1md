const path = require("path");
const fs = require("fs");
const { getUserCount } = require("../lib/userModel");

module.exports = {
    name: "menu",
    aliases: ["help", "list", "m"],
    description: "Display beautiful command menu",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, commands } = ctx;
        const pushName = ctx.msg.pushName || "User";
        
        // 🕰️ Date & Time Logic
        const date = new Date().toLocaleDateString("en-GB");
        const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
        const hours = new Date().getHours();
        let greeting = "Good Night 🌙";
        if (hours < 12) greeting = "Good Morning 🌅";
        else if (hours < 18) greeting = "Good Day 🤠";
        else greeting = "Good Evening 🌃";

        try {
            const allCommands = [...commands.values()];
            const uniqueCommands = allCommands.filter((cmd, index, self) => 
                index === self.findIndex((t) => t.name === cmd.name)
            );

            // 👑 Filter categories
            const categories = {
                admin: uniqueCommands.filter(c => (c.category === "admin" || c.adminOnly) && !c.ownerOnly),
                owner: uniqueCommands.filter(c => c.category === "owner" || c.ownerOnly),
                ai: uniqueCommands.filter(c => c.category === "ai"),
                download: uniqueCommands.filter(c => c.category === "download"),
                group: uniqueCommands.filter(c => c.category === "group"),
                sticker: uniqueCommands.filter(c => c.category === "sticker"),
                social: uniqueCommands.filter(c => c.category === "social"),
                games: uniqueCommands.filter(c => c.category === "games"),
                anime: uniqueCommands.filter(c => c.category === "anime"),
                fun: uniqueCommands.filter(c => c.category === "fun"),
                textmaker: uniqueCommands.filter(c => c.category === "textmaker"),
                economy: uniqueCommands.filter(c => c.category === "economy"),
                media: uniqueCommands.filter(c => c.category === "media"),
                system: uniqueCommands.filter(c => c.category === "system"),
                sports: uniqueCommands.filter(c => c.category === "sports"),
                religion: uniqueCommands.filter(c => c.category === "religion"),
                general: uniqueCommands.filter(c => c.category === "general" && !c.ownerOnly && !c.adminOnly)
            };

            if (args.length > 0) {
                const target = args[0].toLowerCase();
                const list = categories[target];
                
                if (target === "economy") {
                    let econText = `╭━━━━╼ *NEXUS ECONOMY* ╾━━━━╮\n`;
                    econText += `┃ _Manage your wealth & assets_\n┃\n`;
                    econText += `┃ 💳 *FINANCE*\n`;
                    econText += `┃ ┃ 💎 *.balance* - Check wallet\n`;
                    econText += `┃ ┃ 🏦 *.bank* - View savings\n`;
                    econText += `┃ ┃ 📅 *.daily* / *.weekly*\n`;
                    econText += `┃\n`;
                    econText += `┃ 💼 *CAREER & CRIME*\n`;
                    econText += `┃ ┃ 🏢 *.work* - Earn legally\n`;
                    econText += `┃ ┃ 🕵️ *.crime* - High risk\n`;
                    econText += `┃ ┃ 🔫 *.rob* - Take from others\n`;
                    econText += `┃\n`;
                    econText += `┃ 🏪 *MARKET & STORAGE*\n`;
                    econText += `┃ ┃ 🛍️ *.shop* - Buy items\n`;
                    econText += `┃ ┃ 📦 *.inventory* - My gear\n`;
                    econText += `┃ ┃ 💰 *.sell* - Liquidate assets\n`;
                    econText += `┃\n`;
                    econText += `┃ ✨ *PRIVILEGES (SOON)*\n`;
                    econText += `┃ ┃ 💎 VIP-only Commands\n`;
                    econText += `┃ ┃ 🏘️ Property Ownership\n`;
                    econText += `┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
                    return await sock.sendMessage(jid, { text: econText }, { quoted: ctx.msg });
                }

                if (target === "fun") {
                    let funText = `╭━━━━╼ *NEXUS FUN & GAMES* ╾━━━━╮\n`;
                    funText += `┃ _Bring excitement to the chats!_\n┃\n`;
                    funText += `┃ 🎭 *LAUGHTER & HUMOUR*\n`;
                    funText += `┃ ┃ 😂 *.joke* - Random clean joke\n`;
                    funText += `┃ ┃ 🖤 *.darkjoke* - Dark humour\n`;
                    funText += `┃ ┃ 🖼️ *.meme* - Fetch a random meme\n`;
                    funText += `┃ ┃ 🗣️ *.roast* - Roast someone\n`;
                    funText += `┃ ┃ 🤬 *.insult* - Throw an insult\n`;
                    funText += `┃\n`;
                    funText += `┃ 💘 *ROMANCE & RELATIONSHIPS*\n`;
                    funText += `┃ ┃ 💌 *.pickup* - Smooth pickup lines\n`;
                    funText += `┃ ┃ ❤️ *.lovetest* - Test love percentage\n`;
                    funText += `┃ ┃ 🤝 *.bestfriend* - Find your soulmate\n`;
                    funText += `┃ ┃ 💬 *.compliment* - Hype someone up\n`;
                    funText += `┃\n`;
                    funText += `┃ 🕹️ *INTERACTIVE GAMES*\n`;
                    funText += `┃ ┃ 🎱 *.8ball* - Ask the magic ball\n`;
                    funText += `┃ ┃ ❓ *.truth* / *.dare* - Classic game\n`;
                    funText += `┃ ┃ 🤔 *.wyr* - Would You Rather\n`;
                    funText += `┃\n`;
                    funText += `┃ 🧠 *CURIOSITY & PRANKS*\n`;
                    funText += `┃ ┃ 💡 *.fact* - Random interesting fact\n`;
                    funText += `┃ ┃ 💬 *.quote* - Daily wisdom\n`;
                    funText += `┃ ┃ 💻 *.hack* - Prank hack a user\n`;
                    funText += `┃ ┃ 🔍 *.scan* - Scan user data\n`;
                    funText += `┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
                    return await sock.sendMessage(jid, { text: funText }, { quoted: ctx.msg });
                }

                if (list) {
                    let subText = `╭━━━━╼ *${target.toUpperCase()} MENU* ╾━━━━╮\n`;
                    subText += `┃ _Type these to use the features_\n┃\n`;
                    list.forEach((c, i) => {
                        subText += `┃ 💎 *.${c.name}*\n`;
                    });
                    subText += `┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
                    return await sock.sendMessage(jid, { text: subText }, { quoted: ctx.msg });
                } else {
                    return await sock.sendMessage(jid, { 
                        text: `⚠️ *Category "${target}" not found!*\n\nAvailable categories: \`admin, ai, download, group, sticker, anime, games, social, fun, economy, media, sports, religion, system, owner, general\`` 
                    }, { quoted: ctx.msg });
                }
            }

            // 🎨 Level 1: Main Menu (Sleek Dashboard)
            const bannerPath = path.join(__dirname, "../assets/Nexuspic.png");
            const banner = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null;

            let menuBody = `╭━━━━━━━◇\n`;
            menuBody += `┃ *NEXUS-1MD*\n`;
            menuBody += `┃ ◇━━━━━━━◇\n`;
            menuBody += `┃ 🖼️ *${greeting}*\n`;
            menuBody += `╰━━━━━━━◇\n\n`;
            
            const userCount = await getUserCount();
            
            menuBody += `┃ 🤠 *USER:* ${pushName}\n`;
            menuBody += `┃ 📅 *DATE:* ${date}\n`;
            menuBody += `┃ ⌚ *TIME:* ${time}\n`;
            menuBody += `┃ ⭐ *USERS:* ${userCount}\n`;
            menuBody += `╰━━━━━━━━━◇\n\n`;
            
            menuBody += `*AVAILABLE CATEGORIES:*\n`;
            menuBody += `💡 _Explore by typing .menu <name>_\n\n`;
            menuBody += `🌐 *ADMIN MENU*\n`;
            menuBody += `🤖 *AI MENU*\n`;
            menuBody += `📥 *DOWNLOAD MENU*\n`;
            menuBody += `👥 *GROUP MENU*\n`;
            menuBody += `🎨 *STICKER MENU*\n`;
            menuBody += `🎭 *ANIME MENU*\n`;
            menuBody += `🕹️ *GAMES MENU*\n`;
            menuBody += `🤝 *SOCIAL MENU*\n`;
            menuBody += `🎉 *FUN MENU*\n`;
            menuBody += `✨ *TEXTMAKER MENU*\n`;
            menuBody += `💰 *ECONOMY MENU*\n`;
            menuBody += `🎬 *MEDIA MENU*\n`;
            menuBody += `⛪ *RELIGION MENU*\n`;
            menuBody += `🛰️ *SYSTEM MENU*\n`;
            menuBody += `🏀 *SPORTS MENU*\n`;
            menuBody += `📦 *OWNER MENU*\n`;
            menuBody += `🌍 *GENERAL MENU*\n\n`;
            menuBody += `💎 _Type .m <category> or 1-15 for speed_`;

            if (banner) {
                return await sock.sendMessage(jid, {
                    image: banner,
                    caption: menuBody,
                    footer: "Nexus-1MD • Premium Performance"
                }, { quoted: ctx.msg });
            } else {
                return await sock.sendMessage(jid, { text: menuBody }, { quoted: ctx.msg });
            }

        } catch (e) {
            console.error("❌ Menu Dashboard Error:", e);
            await sock.sendMessage(jid, { text: "⚠️ Error loading menu." });
        }
    }
};
