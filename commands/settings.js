const { getSettings, updateSettings } = require("../lib/settings");
const jsonStore = require("../lib/jsonStore");

const on  = "✅ ON";
const off = "❌ OFF";

// ─── Detail panels shown when user replies with a number ──────────────────────
const getPanels = (s) => ({
    1: {
        title: "🤖 BOT CONFIGURATION",
        desc: "Customize your bot identity and behavior.",
        status: `🔹 *Name:* ${s.botName || "Nexus-MD"}\n` +
                `🔹 *Mode:* ${s.publicMode ? "public" : "private"}\n` +
                `   _public = everyone can use, private = owner only_\n` +
                `🔹 *Device:* ${s.device || "Android"}\n` +
                `   _iPhone = plain text messages, Android = full features_\n` +
                `🔹 *Prefix:* ${s.prefix || "."}\n` +
                `🔹 *Pack:* ${s.packName || "Nexus-MD"}\n` +
                `🔹 *Author:* ${s.author || "White Wizard"}\n` +
                `🔹 *Timezone:* ${s.timezone || "Africa/Nairobi"}\n` +
                `🔹 *Bot Image:* ${s.botImage || "Default"}\n` +
                `🔹 *Menu Style:* Style ${s.menuStyle || "1"} — ${s.menuStyle == 2 ? "Buttons" : s.menuStyle == 3 ? "List" : "Lines"}`,
        usage: `▸ \`.botname <name>\` — Change bot name\n` +
               `▸ \`.mode public/private\` — Bot access mode\n` +
               `▸ \`.devicemode iphone/android\` — Message style\n` +
               `▸ \`.prefix <symbol>\` — Change prefix (e.g. ! or #)\n` +
               `▸ \`.packname <name>\` — Sticker pack name\n` +
               `▸ \`.author <name>\` — Sticker author name\n` +
               `▸ \`.timezone <zone>\` — e.g. Africa/Nairobi\n` +
               `▸ \`.botpic\` — Reply to image or video to set bot image\n` +
               `▸ \`.hideviewchannel on/off\` — Hide view channel & forwarded labels\n` +
               `▸ \`.menustyle 1/2/3\` — Switch menu style`
    },
    2: {
        title: "🔗 ANTI-LINK",
        desc: "Automatically detects and handles links posted in groups. You can set it for one specific group or all groups at once.",
        status: `🔹 *All Groups (global):* ${s.antiLinkGlobal === "off" ? "❌ OFF" : `✅ ${s.antiLinkGlobal.toUpperCase()}`}\n` +
                `🔹 *Warn Limit:* ${s.antiLinkLimit || 3}`,
        usage: `▸ \`.antilink warn\` — Enable for this group (warn mode)\n` +
               `▸ \`.antilink delete\` — Enable for this group (delete mode)\n` +
               `▸ \`.antilink remove\` — Enable for this group (kick mode)\n` +
               `▸ \`.antilink off\` — Disable in this group\n` +
               `▸ \`.antilink warn all\` — Enable in ALL groups\n` +
               `▸ \`.antilink delete all\` — Delete in ALL groups\n` +
               `▸ \`.antilink remove all\` — Kick in ALL groups\n` +
               `▸ \`.antilink off all\` — Disable in ALL groups\n` +
               `▸ \`.antilink limit <1-10>\` — Set how many warns before kick\n` +
               `▸ \`.antilink resetwarns\` — Clear all warning counts`
    },
    3: {
        title: "🏷️ ANTI-TAG",
        desc: "Prevents members from mass-tagging everyone in groups.",
        status: `💠 *Status:* ${s.antiTag ? on : off}`,
        usage: `▸ \`.settings 3\` — Toggle ON/OFF`
    },
    4: {
        title: "🗑️ ANTI-DELETE",
        desc: "Recovers deleted messages and sends them to your personal DM.",
        status: `💠 *Status:* ${s.antiDelete ? on : off}`,
        usage: `▸ \`.antidelete on\` — Enable\n▸ \`.antidelete off\` — Disable`
    },
    5: {
        title: "📊 STATUS ANTI-DELETE",
        desc: "Recovers deleted status updates and forwards them to your DM.",
        status: `💠 *Status:* ${s.statusAntiDelete ? on : off}`,
        usage: `▸ \`.antidelete status on\` — Enable\n▸ \`.antidelete status off\` — Disable`
    },
    6: {
        title: "📞 ANTI-CALL",
        desc: "Automatically rejects all incoming voice and video calls.",
        status: `💠 *Status:* ${s.antiCall ? on : off}`,
        usage: `▸ \`.anticall on\` — Enable\n▸ \`.anticall off\` — Disable`
    },
    7: {
        title: "🎭 GROUP EVENTS",
        desc: "Sends automated welcome and goodbye messages when members join or leave your groups.",
        status: `💠 *Welcome:* ${s.welcome ? on : off}\n💠 *Goodbye:* ${s.goodbye ? on : off}`,
        usage: `▸ \`.welcome on/off\` — Toggle welcome\n▸ \`.goodbye on/off\` — Toggle goodbye\n▸ \`.setwelcome <msg>\` — Custom welcome\n▸ \`.setgoodbye <msg>\` — Custom goodbye`
    },
    8: {
        title: "🔄 PRESENCE",
        desc: "Shows a 'typing...' indicator whenever someone messages you, making you appear active.",
        status: `💠 *DM Presence:* ${s.dmPresence ? on : off}\n💠 *Group Presence:* ${s.groupPresence ? on : off}`,
        usage: `▸ \`.presence dm on\` — Enable in DMs\n▸ \`.presence dm off\` — Disable in DMs\n▸ \`.presence grp on\` — Enable in groups\n▸ \`.presence grp off\` — Disable in groups`
    },
    9: {
        title: "👁️ AUTO VIEW STATUS",
        desc: "Automatically views all contacts' status updates with a human-like random delay.",
        status: `💠 *Auto View:* ${s.autoViewStatus ? on : off}\n💠 *Auto React:* ${s.autoLikeStatus ? on : off}`,
        usage: `▸ \`.autostatus view on/off\` — Toggle auto view\n▸ \`.autostatus react on/off\` — Toggle status react`
    },
    10: {
        title: "💬 AUTO REPLY STATUS",
        desc: "Automatically sends a reply to contacts after viewing their status updates.",
        status: `💠 *Status:* ${s.autoReplyStatus ? on : off}\n💠 *Reply Text:* ${s.statusReplyText || "Nice status! ✨"}`,
        usage: `▸ \`.autostatus reply on/off\` — Toggle\n▸ \`.autostatus setreply <text>\` — Set reply text`
    },
    11: {
        title: "📖 AUTO READ",
        desc: "Automatically marks all incoming messages as read (sends blue ticks immediately).",
        status: `💠 *Status:* ${s.autoRead ? on : off}`,
        usage: `▸ \`.settings 11\` — Toggle ON/OFF`
    },
    12: {
        title: "📝 AUTO BIO",
        desc: "Automatically rotates your WhatsApp About/bio text on a timer.",
        status: `💠 *Status:* ${s.autoBio ? on : off}`,
        usage: `▸ \`.settings 12\` — Toggle ON/OFF\n▸ \`.setbio <text1> | <text2> | ...\` — Set rotation texts`
    },
    13: {
        title: "🤖 CHATBOT (AI)",
        desc: "Enables AI-powered automatic replies to private messages using Gemini AI.",
        status: `💠 *Status:* ${s.chatbotAI ? on : off}`,
        usage: `▸ \`.chatbot on\` — Enable AI chatbot\n▸ \`.chatbot off\` — Disable AI chatbot`
    },
    14: {
        title: "👋 GREET (DM AUTO-REPLY)",
        desc: "Sends an automatic one-time greeting when someone messages you in private for the first time. Each contact only gets greeted once (until you clear the memory).",
        status: `💠 *Status:* ${s.greetDM ? on : off}\n💠 *Message:* ${s.greetDMMsg || "Hello! 👋"}\n💠 *Greeted contacts:* ${(jsonStore.get("greeted_users") || []).length}`,
        usage: `▸ \`.greet on\` — Enable greetings\n▸ \`.greet off\` — Disable greetings\n▸ \`.greet set <message>\` — Custom greeting message\n▸ \`.greet clear\` — Reset memory (greet everyone again)`
    },
    15: {
        title: "😍 AUTO REACT",
        desc: "Automatically reacts with a random emoji to incoming messages.",
        status: `💠 *DM React:* ${s.autoReactDM ? on : off}\n💠 *Group React:* ${s.autoReactGrp ? on : off}`,
        usage: `▸ \`.settings 15 dm\` — Toggle DM auto-react\n▸ \`.settings 15 grp\` — Toggle Group auto-react`
    },
    16: {
        title: "🔧 OTHER COMMANDS",
        desc: "Admin and configuration utility commands for Nexus-1MD.",
        status: "",
        usage: `▸ \`.syncsettings all\` — Reset ALL settings to env var defaults\n▸ \`.syncsettings <name>\` — Reset one setting (e.g. anticall, antidelete, autoread)\n▸ \`.allvar\` — View all bot variables at once\n▸ \`.getvar <key>\` — Get a specific variable value\n▸ \`.setvar key=value\` — Change a variable directly\n▸ \`.systeminfo\` — View system info (uptime, memory, version)\n▸ \`.botpic\` — Set bot profile picture\n▸ \`.boturl\` — Set bot URL`
    }
});

module.exports = {
    name: "settings",
    aliases: ["config", "conf"],
    description: "Manage bot configurations and automation",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args } = ctx;
        const settings = getSettings();

        // ── Main menu (no args) ────────────────────────────────────────────────
        if (args.length === 0) {
            const s = settings;
            let menu  = `⚙️ *NEXUS-1MD SETTINGS*\n`;
            menu += `${"─".repeat(30)}\n\n`;
            menu += `_Reply with a number (1-16) to see full details:_\n\n`;
            menu += `1. 🤖 Bot Configuration — Name: ${s.botName || "Nexus-MD"} | Mode: ${s.publicMode ? "public" : "private"}\n`;
            menu += `2. 🔗 Anti-Link — Global: ${s.antiLinkGlobal === "off" ? "❌ OFF" : `✅ ${s.antiLinkGlobal.toUpperCase()}`} | Warn Limit: ${s.antiLinkLimit || 3}\n`;
            menu += `3. 🏷️ Anti-Tag — ${s.antiTag ? on : off}\n`;
            menu += `4. 🗑️ Anti-Delete — ${s.antiDelete ? on : off}\n`;
            menu += `5. 📊 Status Anti-Delete — ${s.statusAntiDelete ? on : off}\n`;
            menu += `6. 📞 Anti-Call — ${s.antiCall ? on : off}\n`;
            menu += `7. 🎭 Group Events — Welcome: ${s.welcome ? on : off} | Goodbye: ${s.goodbye ? on : off}\n`;
            menu += `8. 🔄 Presence — DM: ${s.dmPresence ? on : off} | Grp: ${s.groupPresence ? on : off}\n`;
            menu += `9. 👁️ Auto View Status — ${s.autoViewStatus ? on : off}\n`;
            menu += `10. 💬 Auto Reply Status — ${s.autoReplyStatus ? on : off} | Auto React — ${s.autoLikeStatus ? on : off}\n`;
            menu += `11. 📖 Auto Read — ${s.autoRead ? on : off}\n`;
            menu += `12. 📝 Auto Bio — ${s.autoBio ? on : off}\n`;
            menu += `13. 🤖 Chatbot (AI) — ${s.chatbotAI ? on : off}\n`;
            menu += `14. 👋 Greet (DM Auto-Reply) — ${s.greetDM ? on : off}\n`;
            menu += `15. 😍 Auto React — DM: ${s.autoReactDM ? on : off} | Grp: ${s.autoReactGrp ? on : off}\n`;
            menu += `16. 🔧 Other Commands\n`;

            return await sock.sendMessage(jid, { text: menu });
        }

        const choice = parseInt(args[0]);
        const sub = args[1]?.toLowerCase(); // e.g. "dm", "grp", "toggle"

        // ── Inline toggles (settings that don't have dedicated commands) ───────
        const inlineToggles = {
            3:  () => ({ antiTag: !settings.antiTag }),
            11: () => ({ autoRead: !settings.autoRead }),
            12: () => ({ autoBio: !settings.autoBio }),
            15: () => {
                if (sub === "grp") return { autoReactGrp: !settings.autoReactGrp };
                return { autoReactDM: !settings.autoReactDM };
            }
        };

        if (inlineToggles[choice]) {
            const updates = inlineToggles[choice]();
            Object.assign(settings, updates);
            await updateSettings(updates);
            // Re-fetch updated settings for the panel
            const panels = getPanels(settings);
            const p = panels[choice];
            const separator = "━━━━━━━━━━━━━━━━━━";
            let reply = `*${p.title}*\n${separator}\n\n`;
            reply += `${p.status}\n\n`;
            reply += `✅ *Updated!*\n\n`;
            reply += `🔧 *How to use:*\n${p.usage}\n\n`;
            reply += `_Reply 0 or \`.settings\` to go back_`;
            return await sock.sendMessage(jid, { text: reply });
        }

        // ── Detail panels for all other numbers ───────────────────────────────
        const panels = getPanels(settings);
        const p = panels[choice];

        if (!p) {
            return await sock.sendMessage(jid, { text: "⚠️ Invalid number. Use 1-16." });
        }

        const separator = "━━━━━━━━━━━━━━━━━━";
        let reply = `*${p.title}*\n${separator}\n\n`;
        reply += `${p.desc}\n\n`;
        if (p.status) reply += `${p.status}\n\n`;
        reply += `🔧 *How to use:*\n${p.usage}\n\n`;
        reply += `_Reply 0 or \`.settings\` to go back to menu_`;

        return await sock.sendMessage(jid, { text: reply });
    }
};
