const path = require("path");
const fs = require("fs");
const { getUserCount } = require("../../lib/userModel");
const { getSettings } = require("../../lib/settings");

module.exports = {
    name: "menu",
    aliases: ["help", "list", "m"],
    description: "Display beautiful command menu",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, commands } = ctx;
        const pushName = ctx.msg?.pushName || ctx.msg?.key?.participant?.split("@")[0] || "User";
        
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
                dp: uniqueCommands.filter(c => c.category === "dp"),
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
                    funText += `┃ ┃ 😂 *.joke* / 🖤 *.darkjoke* / 🖼️ *.meme*\n`;
                    funText += `┃ ┃ 🗣️ *.roast* / 🤬 *.insult* / 🗣️ *.sarcasm*\n`;
                    funText += `┃ ┃ 🤡 *.dadjoke* / 🤡 *.pun* / 💀 *.cringe*\n`;
                    funText += `┃ ┃ 🧠 *.brainrot* / 🧠 *.nonsense* / 🧠 *.cursed*\n`;
                    funText += `┃\n`;
                    funText += `┃ 💘 *ROMANCE & SOCIAL*\n`;
                    funText += `┃ ┃ 💌 *.pickup* / ❤️ *.lovetest* / 🤝 *.bestfriend*\n`;
                    funText += `┃ ┃ 💬 *.compliment* / 💑 *.ship* / 💖 *.simp*\n`;
                    funText += `┃\n`;
                    funText += `┃ 🕹️ *GAMES & CHANCE*\n`;
                    funText += `┃ ┃ 🎱 *.8ball* / 🤔 *.wyr* / 🎲 *.luck* / 💡 *.riddle*\n`;
                    funText += `┃ ┃ 🪙 *.coinflip* / 🎲 *.dice* / 🎮 *.rps*\n`;
                    funText += `┃ ┃ ❓ *.truthordare* (or *.tod*) / 🙅‍♂️ *.neverhaveiever*\n`;
                    funText += `┃ ┃ 🔥 *.hotseat* / 🧩 *.emojiquiz* / 🧩 *.scramble*\n`;
                    funText += `┃ ┃ ⚡ *.fasttype* / 📢 *.spamword* / ⚡ *.reactiongame*\n`;
                    funText += `┃ ┃ 🎯 *.clickfast* / 🎲 *.guess*\n`;
                    funText += `┃\n`;
                    funText += `┃ ⚔️ *RPG, COMBAT & PRANKS*\n`;
                    funText += `┃ ┃ 🤺 *.battle* / 🔫 *.duel* / 🧟 *.survive*\n`;
                    funText += `┃ ┃ 🏃‍♂️ *.escape* / 🏦 *.heist* / 🗡️ *.adventure*\n`;
                    funText += `┃ ┃ 📜 *.quest* / 👹 *.bossfight* / 🔍 *.scan*\n`;
                    funText += `┃ ┃ 💻 *.hack* / 🔮 *.future* / 📜 *.pastlife*\n`;
                    funText += `┃\n`;
                    funText += `┃ 📊 *RATERS & METERS*\n`;
                    funText += `┃ ┃ 😎 *.coolness* / 📊 *.sus* / 🤖 *.npc*\n`;
                    funText += `┃ ┃ ⚡ *.power* / 🕶️ *.drip* (or *.fitcheck*) / 🏆 *.tier*\n`;
                    funText += `┃ ┃ 🦸 *.hero* / 🦹 *.villain* / 🌈 *.vibe*\n`;
                    funText += `┃ ┃ 🎭 *.mood* / ⚡ *.energy* / 🍀 *.luckytoday*\n`;
                    funText += `┃ ┃ 🦸 *.superpower* / ❌ *.weakness* / 🛍️ *.pet*\n`;
                    funText += `┃ ┃ 🍔 *.food* / 💼 *.job* / 🌀 *.multiverse*\n`;
                    funText += `┃ ┃ 💭 *.randomthought* / 💡 *.uselessfact* / 💡 *.fact*\n`;
                    funText += `┃ ┃ 💡 *.showerthought* / 📜 *.fakequote* / 📜 *.weirdfact*\n`;
                    funText += `┃ ┃ 📜 *.fortune* / 📝 *.confession* / 🎭 *.drama*\n`;
                    funText += `┃ ┃ 🍵 *.tea* / 🎲 *.chaos* / 🤦 *.realitycheck*\n`;
                    funText += `┃\n`;
                    funText += `┃ 👋 *INTERACTION TAG COMMANDS*\n`;
                    funText += `┃ ┃ 🤗 *.hug* / 🫳 *.pat* / 💥 *.slap* / 👉 *.poke*\n`;
                    funText += `┃ ┃ 🪶 *.tickle* / 🦷 *.bite* / 🔨 *.bonk* / ☄️ *.yeet*\n`;
                    funText += `┃ ┃ 🎳 *.throw* / 🧤 *.catch* / 🙌 *.highfive* / 👋 *.wave*\n`;
                    funText += `┃ ┃ 👀 *.stare* / 😂 *.laugh* / 😭 *.cry* / 😡 *.angry*\n`;
                    funText += `┃ ┃ 🕺 *.dance* / 😴 *.sleep* / 🤦 *.facepalm* / 😕 *.confuse*\n`;
                    funText += `┃ ┃ 🔮 *.summon* / 🚶‍♂️ *.follow* / 😑 *.ignore*\n`;
                    funText += `┃ ┃ ⚔️ *.challenge* / 🎉 *.cheer*\n`;
                    funText += `┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
                    return await sock.sendMessage(jid, { text: funText }, { quoted: ctx.msg });
                }

                if (list) {
                    let subText = `╭━━━━╼ *${target.toUpperCase()} MENU* ╾━━━━╮\n`;
                    subText += `┃ _Type these to use the features_\n┃\n`;
                    list.forEach((c) => {
                        subText += `┃ 💎 *.${c.name}*\n`;
                    });
                    subText += `┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
                    return await sock.sendMessage(jid, { text: subText }, { quoted: ctx.msg });
                } else {
                    return await sock.sendMessage(jid, { 
                        text: `⚠️ *Category "${target}" not found!*\n\nAvailable categories: \`admin, ai, download, group, sticker, anime, games, social, fun, economy, media, sports, religion, dp, system, owner, general\`` 
                    }, { quoted: ctx.msg });
                }
            }

            // 🎨 Main Menu
            const settings = getSettings();
            const botName = settings.botName || "Nexus-MD";
            const botImageUrl = settings.botImage;

            let banner;
            if (botImageUrl && botImageUrl.startsWith("http")) {
                banner = { url: botImageUrl };
            } else {
                const newBotPic = path.join(__dirname, "../../assets/botnexus.png");
                const legacyPic = path.join(__dirname, "../../assets/Nexuspic.jpg");
                const bannerPath = fs.existsSync(newBotPic) ? newBotPic : legacyPic;
                banner = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null;
            }

            const userCount = await getUserCount();

            let menuBody = `╭━━━━━━━◇\n`;
            menuBody += `┃ *${botName.toUpperCase()}*\n`;
            menuBody += `┃ ◇━━━━━━━◇\n`;
            menuBody += `┃ 🖼️ *${greeting}*\n`;
            menuBody += `╰━━━━━━━◇\n\n`;
            menuBody += `┃ 🤠 *USER:* ${pushName}\n`;
            menuBody += `┃ 📅 *DATE:* ${date}\n`;
            menuBody += `┃ ⌚ *TIME:* ${time}\n`;
            menuBody += `┃ ⭐ *USERS:* ${userCount}\n`;
            menuBody += `╰━━━━━━━━━◇\n\n`;
            menuBody += `*AVAILABLE CATEGORIES:*\n`;
            menuBody += `💡 _Explore by typing .m <category>_\n\n`;
            menuBody += `1. 🌐 *ADMIN MENU*\n`;
            menuBody += `2. 🤖 *AI MENU*\n`;
            menuBody += `3. 📥 *DOWNLOAD MENU*\n`;
            menuBody += `4. 👥 *GROUP MENU*\n`;
            menuBody += `5. 🎨 *STICKER MENU*\n`;
            menuBody += `6. 📦 *OWNER MENU*\n`;
            menuBody += `7. 🌍 *GENERAL MENU*\n`;
            menuBody += `8. ⚽ *SPORTS MENU*\n`;
            menuBody += `9. 💻 *DEV INFO* (Direct)\n`;
            menuBody += `10. 🎭 *ANIME MENU*\n`;
            menuBody += `11. 🕹️ *GAMES MENU*\n`;
            menuBody += `12. 🤝 *SOCIAL MENU*\n`;
            menuBody += `13. 🎉 *FUN MENU*\n`;
            menuBody += `14. 💰 *ECONOMY MENU*\n`;
            menuBody += `15. 🎬 *MEDIA MENU*\n`;
            menuBody += `16. 🛰️ *SYSTEM MENU*\n`;
            menuBody += `17. ✨ *TEXTMAKER MENU*\n`;
            menuBody += `18. ⛪ *RELIGION MENU*\n`;
            menuBody += `19. 🖼️ *DP MENU*\n\n`;
            menuBody += `💎 _Type .m <category> to explore features_`;

            const { sendButtonMessage } = require("../../lib/utils");
            const footerText = `${botName} • Support & Updates`;

            // CTA buttons — Channel + Repo only (no group link)
            const buttons = [
                { text: "📢 Follow on WhatsApp", url: "https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02" },
                { text: "💻 GitHub Repo", url: "https://github.com/devwhitewizard/nexus-v1md" }
            ];

            const style = settings.menuStyle || 1;

            if (style === 2) {
                // Style 2: Native flow interactive buttons
                return await sendButtonMessage(sock, jid, menuBody, footerText, buttons, banner, ctx.msg);
            }

            // Style 1 (default): plain text + image — most compatible, always works
            let plainText = menuBody + `\n\n`;
            buttons.forEach(btn => {
                plainText += `🔗 *${btn.text}:* ${btn.url}\n`;
            });
            if (footerText) plainText += `\n_${footerText}_`;

            if (banner) {
                return await sock.sendMessage(jid, { image: banner, caption: plainText }, { quoted: ctx.msg });
            }
            return await sock.sendMessage(jid, { text: plainText }, { quoted: ctx.msg });

        } catch (e) {
            console.error("❌ Menu Dashboard Error:", e);
            await sock.sendMessage(jid, { text: "⚠️ Error loading menu." });
        }
    }
};
