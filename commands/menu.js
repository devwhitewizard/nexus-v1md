const path = require("path");
const fs = require("fs");
const { getUserCount } = require("../lib/userModel");
const { getSettings } = require("../lib/settings");

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
                    list.forEach((c, i) => {
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

            // 🎨 Level 1: Main Menu (Sleek Dashboard)
            const settings = getSettings();
            const botName = settings.botName || "Nexus-MD";
            const botImageUrl = settings.botImage;

            let banner;
            if (botImageUrl && botImageUrl.startsWith("http")) {
                banner = { url: botImageUrl };
            } else {
                const bannerPath = path.join(__dirname, "../assets/Nexuspic.jpg");
                banner = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null;
            }

            let menuBody = `╭━━━━━━━◇\n`;
            menuBody += `┃ *${botName.toUpperCase()}*\n`;
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
            menuBody += `💡 _Explore by typing .menu <name> or the shortcut number_\n\n`;
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
            menuBody += `💬 *Nexus Group:* https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe\n\n`;
            menuBody += `💎 _Type .m <category> or 1-19 for instant access_`;

            const { sendButtonMessage } = require("../lib/utils");
            const footerText = `${botName} • Support & Updates`;
            const buttons = [
                { text: "💬 Bot Group", url: "https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe" },
                { text: "💻 Bot Repo", url: "https://github.com/devwhitewizard/nexus-v1md" },
                { text: "📢 WhatsApp Channel", url: "https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02" }
            ];

            const style = settings.menuStyle || 1;

            if (style === 2) {
                // Style 2: Native flow interactive buttons
                return await sendButtonMessage(sock, jid, menuBody, footerText, buttons, banner, ctx.msg);
            } else if (style === 3) {
                // Style 3: Hybrid List Menu (Single-select dropdown + CTA buttons underneath)
                const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@whiskeysockets/baileys");

                const nativeButtons = [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "Select Category 📂",
                            sections: [
                                {
                                    title: "Nexus Menu Categories",
                                    rows: [
                                        { title: "🌐 Admin Menu", rowId: ".menu admin", description: "Admin tools and controls" },
                                        { title: "🤖 AI Menu", rowId: ".menu ai", description: "AI tools (ChatGPT, Imagine etc.)" },
                                        { title: "📥 Download Menu", rowId: ".menu download", description: "Video & audio downloaders" },
                                        { title: "👥 Group Menu", rowId: ".menu group", description: "Group management tools" },
                                        { title: "🎨 Sticker Menu", rowId: ".menu sticker", description: "Create and edit stickers" },
                                        { title: "📦 Owner Menu", rowId: ".menu owner", description: "Owner-only settings & tools" },
                                        { title: "🌍 General Menu", rowId: ".menu general", description: "General utility commands" },
                                        { title: "⚽ Sports Menu", rowId: ".menu sports", description: "Football, livescores & matches" },
                                        { title: "🎭 Anime Menu", rowId: ".menu anime", description: "Anime images, search & quotes" },
                                        { title: "🕹️ Games Menu", rowId: ".menu games", description: "Fun text games and challenges" },
                                        { title: "🤝 Social Menu", rowId: ".menu social", description: "Social & fun interaction commands" },
                                        { title: "🎉 Fun Menu", rowId: ".menu fun", description: "Jokes, memes, raters & RPG games" },
                                        { title: "💰 Economy Menu", rowId: ".menu economy", description: "Coins, balance, job & daily reward" },
                                        { title: "🎬 Media Menu", rowId: ".menu media", description: "Image converters, OCR & audio tools" },
                                        { title: "🛰️ System Menu", rowId: ".menu system", description: "Bot runtime stats & developer info" },
                                        { title: "⛪ Religion Menu", rowId: ".menu religion", description: "Quran & Bible scriptures" },
                                        { title: "🖼️ DP Menu", rowId: ".menu dp", description: "DP makers and graphics" }
                                    ]
                                }
                            ]
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "💬 Bot Group",
                            url: "https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe",
                            merchant_url: "https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe"
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "💻 Bot Repo",
                            url: "https://github.com/devwhitewizard/nexus-v1md",
                            merchant_url: "https://github.com/devwhitewizard/nexus-v1md"
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📢 WhatsApp Channel",
                            url: "https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02",
                            merchant_url: "https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02"
                        })
                    }
                ];

                let header = {};
                if (banner) {
                    const isObj = banner && typeof banner === "object" && !Buffer.isBuffer(banner);
                    const hasUrl = isObj && banner.url;
                    if (Buffer.isBuffer(banner) || typeof banner === "string" || hasUrl) {
                        try {
                            const prepared = await prepareWAMessageMedia(
                                { image: Buffer.isBuffer(banner) ? banner : (hasUrl ? { url: banner.url } : { url: banner }) },
                                { upload: sock.waUploadToServer }
                            );
                            header = {
                                title: "",
                                hasMediaAttachment: true,
                                imageMessage: prepared.imageMessage
                            };
                        } catch (err) {
                            console.error("❌ Failed to prepare media banner for Style 3:", err.message);
                        }
                    }
                }

                const hasQuotedContent = ctx.msg && ctx.msg.key && ctx.msg.message && Object.keys(ctx.msg.message).length > 0;

                const msg = generateWAMessageFromContent(jid, {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        header: Object.keys(header).length > 0 ? proto.Message.InteractiveMessage.Header.create(header) : undefined,
                        body: proto.Message.InteractiveMessage.Body.create({ text: menuBody }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: nativeButtons
                        })
                    })
                }, { 
                    quoted: hasQuotedContent ? ctx.msg : undefined,
                    userJid: sock.user?.id || sock.authState?.creds?.me?.id || global.myJid
                });

                try {
                    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
                    return msg;
                } catch (err) {
                    console.error("❌ Hybrid Style 3 failed, falling back to Style 1:", err.message);
                }
            }

            // Default Style 1: Plain text layout with media caption (highly compatible)
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
