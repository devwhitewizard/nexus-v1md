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
        usage: `▸ Reply "mode" or "toggle" — Toggle public/private mode\n` +
               `▸ \`.mode public/private\` — Bot access mode\n` +
               `▸ \`.botname <name>\` — Change bot name\n` +
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
        usage: `▸ Reply "2" or "toggle" — Cycle global anti-link mode\n` +
               `▸ Reply "warn", "delete", "remove", or "off" — Set global anti-link\n` +
               `▸ \`.antilink warn\` — Enable for this group (warn mode)\n` +
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
        title: "🏷️ ANTI-STATUS-MENTION (ANTITAG)",
        desc: "Blocks users who send status mention/tag messages in groups. Set per-group or for all groups.",
        status: `🔹 *All Groups (global):* ${s.antiStatusMentionGlobal === "off" ? "❌ OFF" : `✅ ${s.antiStatusMentionGlobal.toUpperCase()}`}\n` +
                `🔹 *Warn Limit:* ${s.antiStatusMentionLimit || 3}`,
        usage: `▸ Reply "3" or "toggle" — Cycle global antitag mode\n` +
               `▸ Reply "warn", "delete", "remove", or "off" — Set global antitag\n` +
               `▸ \`.antistatusmention warn\` — Enable for this group (warn mode)\n` +
               `▸ \`.antistatusmention delete\` — Enable for this group (delete mode)\n` +
               `▸ \`.antistatusmention remove\` — Enable for this group (kick mode)\n` +
               `▸ \`.antistatusmention off\` — Disable in this group\n` +
               `▸ \`.antistatusmention warn all\` — Enable in ALL groups\n` +
               `▸ \`.antistatusmention delete all\` — Delete in ALL groups\n` +
               `▸ \`.antistatusmention remove all\` — Kick in ALL groups\n` +
               `▸ \`.antistatusmention off all\` — Disable in ALL groups\n` +
               `▸ \`.antistatusmention limit <1-10>\` — Set how many warns before kick\n` +
               `▸ \`.antistatusmention resetwarns\` — Clear all warning counts`
    },
    4: {
        title: "🗑️ ANTI-DELETE",
        desc: "Recovers deleted messages and sends them to your personal DM.",
        status: `💠 *Status:* ${s.antiDelete ? on : off}`,
        usage: `▸ Reply "4" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.antidelete on\` — Enable\n` +
               `▸ \`.antidelete off\` — Disable`
    },
    5: {
        title: "📊 STATUS ANTI-DELETE",
        desc: "Recovers deleted status updates and forwards them to your DM.",
        status: `💠 *Status:* ${s.statusAntiDelete ? on : off}`,
        usage: `▸ Reply "5" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.antidelete status on\` — Enable\n` +
               `▸ \`.antidelete status off\` — Disable`
    },
    6: {
        title: "📞 ANTI-CALL",
        desc: "Automatically rejects all incoming voice and video calls.",
        status: `💠 *Status:* ${s.antiCall ? on : off}`,
        usage: `▸ Reply "6" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.anticall on\` — Enable\n` +
               `▸ \`.anticall off\` — Disable`
    },
    7: {
        title: "🎭 GROUP EVENTS",
        desc: "Sends welcome messages when new members join and goodbye messages when they leave. Also notifies about promotions/demotions. Set per-group or globally.",
        status: `🔹 *All Groups (global):* ${s.groupEventsGlobal ? "✅ ON" : "❌ OFF"}\n` +
                `🔹 *Promotion Alerts:* ${s.eventsPromote ? "✅ ON" : "❌ OFF"}`,
        usage: `▸ Reply "7" or "toggle" — Toggle global events ON/OFF\n` +
               `▸ Reply "on" or "off" — Set global events status\n` +
               `▸ \`.events on\` — Enable in this group\n` +
               `▸ \`.events off\` — Disable in this group\n` +
               `▸ \`.events on all\` — Enable in ALL groups\n` +
               `▸ \`.events off all\` — Disable in ALL groups\n` +
               `▸ \`.events promote on/off\` — Show promotion notices\n` +
               `▸ \`.events welcome <message>\` — Set welcome message\n` +
               `▸ \`.events welcome <message> all\` — Set for all groups\n` +
               `▸ \`.events goodbye <message>\` — Set goodbye message\n` +
               `▸ \`.events goodbye <message> all\` — Set for all groups\n\n` +
               `*Placeholders available:*\n` +
               `▸ \`@user\` — Mentions member\n` +
               `▸ \`{group}\` — Group name\n` +
               `▸ \`{count}\` — Member count\n` +
               `▸ \`{time}\` — Join/leave time\n` +
               `▸ \`{desc}\` — Group description`
    },
    8: {
        title: "🔄 PRESENCE",
        desc: "Shows a 'typing...' indicator whenever someone messages you, making you appear active.",
        status: `💠 *DM Presence:* ${s.dmPresence ? on : off}\n💠 *Group Presence:* ${s.groupPresence ? on : off}`,
        usage: `▸ Reply "dm" — Toggle DM Presence\n` +
               `▸ Reply "grp" — Toggle Group Presence\n` +
               `▸ \`.presence dm on/off\` — Set in DMs\n` +
               `▸ \`.presence grp on/off\` — Set in groups`
    },
    9: {
        title: "👁️ AUTO VIEW STATUS",
        desc: "Automatically views all contacts' status updates with a human-like random delay.",
        status: `💠 *Auto View:* ${s.autoViewStatus ? on : off}\n💠 *Auto React:* ${s.autoLikeStatus ? on : off}`,
        usage: `▸ Reply "9" or "toggle" — Toggle auto view ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.autostatus view on/off\` — Toggle auto view\n` +
               `▸ \`.autostatus react on/off\` — Toggle status react`
    },
    10: {
        title: "💬 AUTO REPLY STATUS",
        desc: "Automatically sends a reply to contacts after viewing their status updates.",
        status: `💠 *Status:* ${s.autoReplyStatus ? on : off}\n💠 *Reply Text:* ${s.statusReplyText || "Nice status! ✨"}`,
        usage: `▸ Reply "10" or "toggle" — Toggle auto reply ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.autostatus reply on/off\` — Toggle reply\n` +
               `▸ \`.autostatus setreply <text>\` — Set reply text`
    },
    11: {
        title: "📖 AUTO READ",
        desc: "Automatically marks all incoming messages as read (sends blue ticks immediately).",
        status: `💠 *Status:* ${s.autoRead ? on : off}`,
        usage: `▸ Reply "11" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.autoread on\` — Enable\n` +
               `▸ \`.autoread off\` — Disable`
    },
    12: {
        title: "📝 AUTO BIO",
        desc: "Automatically rotates your WhatsApp About/bio text on a timer.",
        status: `💠 *Status:* ${s.autoBio ? on : off}`,
        usage: `▸ Reply "12" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.setbio <text1> | <text2> | ...\` — Set rotation texts`
    },
    13: {
        title: "🤖 CHATBOT (AI)",
        desc: "Enables AI-powered automatic replies to private messages using Gemini AI.",
        status: `💠 *Status:* ${s.chatbotAI ? on : off}`,
        usage: `▸ Reply "13" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.chatbot on\` — Enable AI chatbot\n` +
               `▸ \`.chatbot off\` — Disable AI chatbot`
    },
    14: {
        title: "👋 GREET (DM AUTO-REPLY)",
        desc: "Sends an automatic one-time greeting when someone messages you in private for the first time. Each contact only gets greeted once (until you clear the memory).",
        status: `💠 *Status:* ${s.greetDM ? on : off}\n💠 *Message:* ${s.greetDMMsg || "Hello! 👋"}\n💠 *Greeted contacts:* ${(jsonStore.get("greeted_users") || []).length}`,
        usage: `▸ Reply "14" or "toggle" — Toggle ON/OFF\n` +
               `▸ Reply "on" or "off" — Set status\n` +
               `▸ \`.greet on\` — Enable greetings\n` +
               `▸ \`.greet off\` — Disable greetings\n` +
               `▸ \`.greet set <message>\` — Custom greeting message\n` +
               `▸ \`.greet clear\` — Reset memory (greet everyone again)`
    },
    15: {
        title: "😍 AUTO REACT",
        desc: "Automatically reacts with a random emoji to incoming messages.",
        status: `💠 *DM React:* ${s.autoReactDM ? on : off}\n💠 *Group React:* ${s.autoReactGrp ? on : off}`,
        usage: `▸ Reply "dm" — Toggle DM auto-react\n` +
               `▸ Reply "grp" — Toggle Group auto-react\n` +
               `▸ \`.settings 15 dm\` — Toggle DM auto-react\n` +
               `▸ \`.settings 15 grp\` — Toggle Group auto-react`
    },
    16: {
        title: "🔧 OTHER COMMANDS",
        desc: "Admin and configuration utility commands for Nexus-1MD.",
        status: "",
        usage: `▸ \`.syncsettings all\` — Reset ALL settings to env var defaults\n` +
               `▸ \`.syncsettings <name>\` — Reset one setting (e.g. anticall, antidelete, autoread)\n` +
               `▸ \`.allvar\` — View all bot variables at once\n` +
               `▸ \`.getvar <key>\` — Get a specific variable value\n` +
               `▸ \`.setvar key=value\` — Change a variable directly\n` +
               `▸ \`.systeminfo\` — View system info (uptime, memory, version)\n` +
               `▸ \`.botpic\` — Set bot profile picture\n` +
               `▸ \`.boturl\` — Set bot URL`
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

        // ── Main menu (no args or choice 0) ────────────────────────────────────
        if (args.length === 0 || parseInt(args[0]) === 0) {
            const s = settings;
            let menu  = `⚙️ *NEXUS-1MD SETTINGS*\n`;
            menu += `${"─".repeat(30)}\n\n`;
            menu += `_Reply with \`.settings <number>\` (e.g. \`.settings 4\`) to configure:_\n\n`;
            menu += `1. 🤖 Bot Configuration — Name: ${s.botName || "Nexus-MD"} | Mode: ${s.publicMode ? "public" : "private"}\n`;
            menu += `2. 🔗 Anti-Link — Global: ${s.antiLinkGlobal === "off" ? "❌ OFF" : `✅ ${s.antiLinkGlobal.toUpperCase()}`} | Warn Limit: ${s.antiLinkLimit || 3}\n`;
            menu += `3. 🏷️ Anti-Status-Mention — Global: ${s.antiStatusMentionGlobal === "off" ? "❌ OFF" : `✅ ${s.antiStatusMentionGlobal.toUpperCase()}`} | Warn Limit: ${s.antiStatusMentionLimit || 3}\n`;
            menu += `4. 🗑️ Anti-Delete — ${s.antiDelete ? on : off}\n`;
            menu += `5. 📊 Status Anti-Delete — ${s.statusAntiDelete ? on : off}\n`;
            menu += `6. 📞 Anti-Call — ${s.antiCall ? on : off}\n`;
            menu += `7. 🎭 Group Events — Global: ${s.groupEventsGlobal ? on : off} | Promote: ${s.eventsPromote ? on : off}\n`;
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
        const sub = args[1]?.toLowerCase(); // e.g. "dm", "grp", "toggle", "on", "off"

        const panels = getPanels(settings);
        const p = panels[choice];

        if (!p) {
            return await sock.sendMessage(jid, { text: "⚠️ Invalid number. Use 1-16." });
        }

        // ── Inline toggles (settings that can be changed directly) ─────────────
        const inlineToggles = {
            1: () => {
                if (sub === "mode" || sub === "toggle") return { publicMode: !settings.publicMode };
                return {};
            },
            2: () => {
                const modes = ["off", "warn", "delete", "remove"];
                if (modes.includes(sub)) return { antiLinkGlobal: sub };
                if (sub === "toggle" || sub === "2") {
                    const currentIndex = modes.indexOf(settings.antiLinkGlobal || "off");
                    const nextIndex = (currentIndex + 1) % modes.length;
                    return { antiLinkGlobal: modes[nextIndex] };
                }
                return {};
            },
            3: () => {
                const modes = ["off", "warn", "delete", "remove"];
                if (modes.includes(sub)) return { antiStatusMentionGlobal: sub };
                if (sub === "toggle" || sub === "3") {
                    const currentIndex = modes.indexOf(settings.antiStatusMentionGlobal || "off");
                    const nextIndex = (currentIndex + 1) % modes.length;
                    return { antiStatusMentionGlobal: modes[nextIndex] };
                }
                return {};
            },
            4: () => {
                if (sub === "on") return { antiDelete: true };
                if (sub === "off") return { antiDelete: false };
                if (sub === "toggle" || sub === "4") return { antiDelete: !settings.antiDelete };
                return {};
            },
            5: () => {
                if (sub === "on") return { statusAntiDelete: true };
                if (sub === "off") return { statusAntiDelete: false };
                if (sub === "toggle" || sub === "5") return { statusAntiDelete: !settings.statusAntiDelete };
                return {};
            },
            6: () => {
                if (sub === "on") return { antiCall: true };
                if (sub === "off") return { antiCall: false };
                if (sub === "toggle" || sub === "6") return { antiCall: !settings.antiCall };
                return {};
            },
            7: () => {
                if (sub === "on") return { groupEventsGlobal: true };
                if (sub === "off") return { groupEventsGlobal: false };
                if (sub === "toggle" || sub === "7") return { groupEventsGlobal: !settings.groupEventsGlobal };
                return {};
            },
            8: () => {
                if (sub === "grp") return { groupPresence: !settings.groupPresence };
                if (sub === "dm") return { dmPresence: !settings.dmPresence };
                if (sub === "toggle" || sub === "8") return { dmPresence: !settings.dmPresence };
                return {};
            },
            9: () => {
                if (sub === "on") return { autoViewStatus: true };
                if (sub === "off") return { autoViewStatus: false };
                if (sub === "toggle" || sub === "9") return { autoViewStatus: !settings.autoViewStatus };
                return {};
            },
            10: () => {
                if (sub === "on") return { autoReplyStatus: true };
                if (sub === "off") return { autoReplyStatus: false };
                if (sub === "toggle" || sub === "10") return { autoReplyStatus: !settings.autoReplyStatus };
                return {};
            },
            11: () => {
                if (sub === "on") return { autoRead: true };
                if (sub === "off") return { autoRead: false };
                if (sub === "toggle" || sub === "11") return { autoRead: !settings.autoRead };
                return {};
            },
            12: () => {
                if (sub === "on") return { autoBio: true };
                if (sub === "off") return { autoBio: false };
                if (sub === "toggle" || sub === "12") return { autoBio: !settings.autoBio };
                return {};
            },
            13: () => {
                if (sub === "on") return { chatbotAI: true };
                if (sub === "off") return { chatbotAI: false };
                if (sub === "toggle" || sub === "13") return { chatbotAI: !settings.chatbotAI };
                return {};
            },
            14: () => {
                if (sub === "on") return { greetDM: true };
                if (sub === "off") return { greetDM: false };
                if (sub === "toggle" || sub === "14") return { greetDM: !settings.greetDM };
                return {};
            },
            15: () => {
                if (sub === "grp") return { autoReactGrp: !settings.autoReactGrp };
                if (sub === "dm") return { autoReactDM: !settings.autoReactDM };
                if (sub === "toggle" || sub === "15") return { autoReactDM: !settings.autoReactDM };
                return {};
            }
        };

        if (sub && inlineToggles[choice]) {
            const updates = inlineToggles[choice]();
            if (Object.keys(updates).length > 0) {
                Object.assign(settings, updates);
                await updateSettings(updates);
            }
            // Re-fetch updated settings for the panel
            const updatedPanels = getPanels(settings);
            const up = updatedPanels[choice];
            const separator = "━━━━━━━━━━━━━━━━━━";
            let reply = `*${up.title}*\n${separator}\n\n`;
            reply += `${up.status}\n\n`;
            reply += `✅ *Updated!*\n\n`;
            reply += `🔧 *How to use:*\n${up.usage}\n\n`;
            reply += `_Reply 0 or \`.settings\` to go back_`;
            return await sock.sendMessage(jid, { text: reply });
        }

        // ── Detail panels (no sub action specified) ───────────────────────────
        const separator = "━━━━━━━━━━━━━━━━━━";
        let reply = `*${p.title}*\n${separator}\n\n`;
        reply += `${p.desc}\n\n`;
        if (p.status) reply += `${p.status}\n\n`;
        reply += `🔧 *How to use:*\n${p.usage}\n\n`;
        reply += `_Reply 0 or \`.settings\` to go back to menu_`;

        return await sock.sendMessage(jid, { text: reply });
    }
};
