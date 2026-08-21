const path = require("path");
const fs = require("fs");
const { getUserCount } = require("../../nexus/userModel");
const { getSettings } = require("../../lib/settings");
const { sendButtonMessage } = require("../../lib/utils");

// Category display config: emoji + label
const CATEGORY_META = {
    general: { icon: "🛠️", label: "GENERAL" },
    download: { icon: "📥", label: "DOWNLOAD" },
    ai: { icon: "🤖", label: "AI" },
    media: { icon: "🎬", label: "MEDIA" },
    sticker: { icon: "🎨", label: "STICKER" },
    fun: { icon: "🎉", label: "FUN" },
    games: { icon: "🕹️", label: "GAMES" },
    social: { icon: "🤝", label: "SOCIAL" },
    anime: { icon: "🎭", label: "ANIME" },
    economy: { icon: "💰", label: "ECONOMY" },
    sports: { icon: "⚽", label: "SPORTS" },
    religion: { icon: "⛪", label: "RELIGION" },
    dp: { icon: "🖼️", label: "DP" },
    group: { icon: "👥", label: "GROUP" },
    admin: { icon: "⚙️", label: "ADMIN" },
    system: { icon: "🛰️", label: "SYSTEM" },
    textmaker: { icon: "✨", label: "TEXTMAKER" },
    owner: { icon: "📦", label: "OWNER" },
};

// Strict, clean display order
const CATEGORY_ORDER = [
    "general", "download", "ai", "media", "sticker", "fun", "games",
    "social", "anime", "economy", "sports", "religion", "dp",
    "group", "admin", "system", "textmaker", "owner"
];

// Usage parameter hints for commands
const USAGE_HINTS = {
    // Textmaker Logo Generators
    "1917": "<text>",
    advancedglow: "<text>",
    arena: "<text>",
    arting: "<text>",
    blackpink: "<text>",
    blackpinkstyle: "<text>",
    cartoonstyle: "<text>",
    comic: "<text>",
    corntext: "<text>",
    deadpool: "<text>",
    devil: "<text>",
    devilwings: "<text>",
    dragonball: "<text>",
    effectclouds: "<text>",
    fire: "<text>",
    flagtext: "<text>",
    flux: "<text>",
    galaxystyle: "<text>",
    galaxywallpaper: "<text>",
    glitch: "<text>",
    glowingtext: "<text>",
    glossysilver: "<text>",
    hacker: "<text>",
    ice: "<text>",
    impressive: "<text>",
    leaves: "<text>",
    light: "<text>",
    luxurygold: "<text>",
    makingneon: "<text>",
    matrix: "<text>",
    metallic: "<text>",
    multicoloredneon: "<text>",
    naruto: "<text>",
    neon: "<text>",
    painttext: "<text>",
    pixelglitch: "<text>",
    pubglogo: "<text>",
    purple: "<text>",
    royaltext: "<text>",
    sand: "<text>",
    snow: "<text>",
    summerbeach: "<text>",
    textonwetglass: "<text>",
    thunder: "<text>",
    typography: "<text>",
    underwater: "<text>",
    vintagetext: "<text>",
    vintagetext: "<text>",
    wingslogo: "<text>",
    wolfgalaxy: "<text>",

    // AI
    ai: "<question>",
    ask: "<question>",
    deepseek: "<query>",
    ds: "<query>",
    guru: "<query>",
    chat: "<message>",
    code: "<prompt>",
    explain: "<topic>",
    imagine: "<prompt>",
    draw: "<prompt>",

    // Download
    tiktok: "<link>",
    tt: "<link>",
    instagram: "<link>",
    ig: "<link>",
    reels: "<link>",
    facebook: "<link>",
    fb: "<link>",
    twitter: "<link>",
    tw: "<link>",
    linkedin: "<link>",
    li: "<link>",
    play: "<song>",
    yt: "<link>",

    // Admin & Group
    kick: "<user>",
    ban: "<user>",
    mute: "[time]",
    unmute: "",
    promote: "<user>",
    demote: "<user>",
    tagall: "[reason]",
    hidetag: "<message>",

    // General & Tools
    savestatus: "<reply>",
    save: "<reply>",
    sv: "<reply>",
    sharestatus: "[all]",
    gcstatus: "[message]",
    hideviewchannel: "<on/off>",
    statusemoji: "<emojis>",
    mode: "[public/private]",
    calc: "<math>",
    translate: "<text>",
    weather: "<city>",
    wiki: "<query>",
    qr: "<text>",
    readqr: "",
    tts: "<text>",
    shorten: "<link>",
    ocr: "<image>",
    menu: "[cat]"
};

/**
 * Format commands in strict vertical tree list matching screenshot:
 * │ > .command <args>
 */
function formatCategoryCommands(cmds) {
    return cmds.map(c => {
        let hint = c.usage || USAGE_HINTS[c.name] || "";
        if (typeof hint === "string" && hint.startsWith(".")) {
            const parts = hint.trim().split(/\s+/);
            hint = parts.length > 1 ? parts.slice(1).join(" ") : "";
        }
        const paramStr = hint ? ` ${hint}` : "";
        return `│ > .${c.name}${paramStr}`;
    }).join("\n");
}

module.exports = {
    name: "menu",
    aliases: ["help", "list", "m"],
    description: "List all commands in stylized tree layout",
    category: "general",
    noAutoDelete: true,

    execute: async (ctx) => {
        const { sock, jid, args, commands } = ctx;
        const pushName = ctx.msg?.pushName || ctx.msg?.key?.participant?.split("@")[0] || "User";

        // 🕰️ Date & Time
        const date = new Date().toLocaleDateString("en-GB");
        const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
        const hours = new Date().getHours();
        let greeting = "Good Night 🌙";
        if (hours < 12) greeting = "Good Morning 🌅";
        else if (hours < 18) greeting = "Good Day 🤠";
        else greeting = "Good Evening 🌃";

        const settings = getSettings();
        const botName = settings.botName || "Nexus-MD";
        const CHANNEL_URL = "https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02";
        const REPO_URL = "https://github.com/devwhitewizard/nexus-v1md";

        try {
            // ── De-duplicate commands ──────────────────────────────────────────
            const allCommands = [...commands.values()];
            const uniqueCommands = allCommands.filter((cmd, idx, self) =>
                idx === self.findIndex(t => t.name === cmd.name)
            );

            // ── Build grouped map ──────────────────────────────────────────────
            const grouped = {};
            for (const cmd of uniqueCommands) {
                const cat = (cmd.category || "general").toLowerCase();
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(cmd);
            }
            // Sort commands alphabetically within each category
            for (const cat of Object.keys(grouped)) {
                grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
            }

            // ── Determine ordered category list ────────────────────────────────
            const allCats = [...new Set([
                ...CATEGORY_ORDER.filter(c => grouped[c]),
                ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c))
            ])];

            const channelButtons = [
                { text: "📢 Follow Channel", url: CHANNEL_URL }
            ];

            // ── Handle .menu <category> or .menu <command> ─────────────────────
            if (args.length > 0) {
                const target = args[0].toLowerCase().replace(/^\./, "");

                // ① Match a category
                if (grouped[target]) {
                    const meta = CATEGORY_META[target] || { icon: "📁", label: target.toUpperCase() };
                    const cmds = grouped[target];
                    let txt = `┌───[ ${meta.icon} ${meta.label} ] [${cmds.length}]\n`;
                    txt += formatCategoryCommands(cmds) + "\n";
                    txt += `└─────────────────────────────`;
                    return await sendButtonMessage(sock, jid, txt, botName, channelButtons, null, ctx.msg);
                }

                // ② Match a specific command or alias
                const foundCmd = commands.get(target);
                if (foundCmd) {
                    const meta = CATEGORY_META[foundCmd.category] || { icon: "📁", label: (foundCmd.category || "general").toUpperCase() };
                    let hint = foundCmd.usage || USAGE_HINTS[foundCmd.name] || "";
                    if (typeof hint === "string" && hint.startsWith(".")) {
                        const parts = hint.trim().split(/\s+/);
                        hint = parts.length > 1 ? parts.slice(1).join(" ") : "";
                    }
                    let card = `┌───[ 🔍 COMMAND HELP ]\n`;
                    card += `│ > Command: .${foundCmd.name}${hint ? " " + hint : ""}\n`;
                    if (foundCmd.description) card += `│ > What it does: ${foundCmd.description}\n`;
                    if (foundCmd.category) card += `│ > Category: ${meta.icon} ${meta.label}\n`;
                    if (foundCmd.aliases && foundCmd.aliases.length)
                        card += `│ > Aliases: ${foundCmd.aliases.map(a => `.${a}`).join(", ")}\n`;
                    card += `└─────────────────────────────`;
                    return await sendButtonMessage(sock, jid, card, botName, channelButtons, null, ctx.msg);
                }

                // ③ Not found
                const catList = allCats.map(c => {
                    const m = CATEGORY_META[c] || { icon: "📁" };
                    return `${m.icon} \`${c}\` [${grouped[c]?.length || 0}]`;
                }).join("  •  ");
                return await sock.sendMessage(jid, {
                    text: `⚠️ *"${target}" not found.*\n\n📂 *Available Categories:*\n${catList}\n\n💡 _Try_ *.menu download* _or_ *.menu ping_`
                }, { quoted: ctx.msg });
            }

            // ── Main "all commands" menu ───────────────────────────────────────
            let userCount = 1;
            try {
                userCount = await Promise.race([
                    getUserCount(),
                    new Promise(res => setTimeout(() => res(1), 1000))
                ]);
            } catch (_) { userCount = 1; }

            const totalCmdCount = uniqueCommands.length;

            // Header card
            let body = "";
            body += `┌───[ 💎 ${botName.toUpperCase()} ]\n`;
            body += `│ > User: ${pushName}\n`;
            body += `│ > Greeting: ${greeting}\n`;
            body += `│ > Date: ${date}\n`;
            body += `│ > Time: ${time}\n`;
            body += `│ > Total Commands: [${totalCmdCount}]\n`;
            body += `│ > Active Users: ${userCount}\n`;
            body += `└─────────────────────────────\n\n`;

            // Category cards styled exactly like screenshot
            for (const cat of allCats) {
                const cmds = grouped[cat];
                if (!cmds || cmds.length === 0) continue;
                const meta = CATEGORY_META[cat] || { icon: "📁", label: cat.toUpperCase() };

                body += `┌───[ ${meta.icon} ${meta.label} ] [${cmds.length}]\n`;
                body += formatCategoryCommands(cmds) + "\n";
                body += `└─────────────────────────────\n\n`;
            }

            // Bot banner image
            let banner = null;
            try {
                if (settings.botImage && settings.botImage.startsWith("http")) {
                    banner = { url: settings.botImage };
                } else {
                    const newPic = path.join(__dirname, "../../assets/botnexus.png");
                    const oldPic = path.join(__dirname, "../../assets/Nexuspic.jpg");
                    const picPath = fs.existsSync(newPic) ? newPic : oldPic;
                    if (fs.existsSync(picPath)) banner = fs.readFileSync(picPath);
                }
            } catch (_) { banner = null; }

            return await sendButtonMessage(sock, jid, body.trim(), botName, channelButtons, banner, ctx.msg);

        } catch (e) {
            console.error("❌ Menu error:", e);
            await sock.sendMessage(jid, { text: "⚠️ Error loading menu. Try again." });
        }
    }
};
