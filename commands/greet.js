const { getSettings, updateSettings } = require("../lib/settings");
const jsonStore = require("../lib/jsonStore");

module.exports = {
    name: "greet",
    aliases: ["greetdm"],
    description: "Manage the DM auto-greeting feature",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, args, msg }) => {
        const settings = getSettings();
        const sub = args[0]?.toLowerCase();

        const greetedUsers = jsonStore.get("greeted_users") || [];

        // ── No args → show detail panel ───────────────────────────────────────
        if (!sub) {
            const on  = "✅ ON";
            const off = "❌ OFF";
            let text = `*👋 GREET (DM AUTO-REPLY)*\n${"─".repeat(28)}\n\n`;
            text += `Sends an automatic one-time greeting when someone messages you in private for the first time. Each contact only gets greeted once (until you clear the memory).\n\n`;
            text += `💠 *Status:* ${settings.greetDM ? on : off}\n`;
            text += `💠 *Message:* ${settings.greetDMMsg || "Hello! 👋"}\n`;
            text += `💠 *Greeted contacts:* ${greetedUsers.length}\n\n`;
            text += `🔧 *How to use:*\n`;
            text += `▸ \`.greet on\` — Enable greetings\n`;
            text += `▸ \`.greet off\` — Disable greetings\n`;
            text += `▸ \`.greet set <message>\` — Custom greeting message\n`;
            text += `▸ \`.greet clear\` — Reset memory (greet everyone again)`;
            return await sock.sendMessage(jid, { text }, { quoted: msg });
        }

        // ── .greet on ─────────────────────────────────────────────────────────
        if (sub === "on") {
            await updateSettings({ greetDM: true });
            return await sock.sendMessage(jid, {
                text: `✅ *Greet DM is now ON!*\n\n_New contacts will receive:_\n"${settings.greetDMMsg || "Hello! 👋"}"\n\n_Use \`.greet set <message>\` to customize it._`
            }, { quoted: msg });
        }

        // ── .greet off ────────────────────────────────────────────────────────
        if (sub === "off") {
            await updateSettings({ greetDM: false });
            return await sock.sendMessage(jid, {
                text: `❌ *Greet DM is now OFF.*\n\n_New contacts will no longer receive auto-greetings._`
            }, { quoted: msg });
        }

        // ── .greet set <message> ──────────────────────────────────────────────
        if (sub === "set") {
            const newMsg = args.slice(1).join(" ").trim();
            if (!newMsg) {
                return await sock.sendMessage(jid, {
                    text: `❓ *Usage:* \`.greet set <your message>\`\n\nExample:\n\`.greet set Hey! 👋 Thanks for texting me.\`\n\n_Use @user to mention the contact's name._`
                }, { quoted: msg });
            }
            await updateSettings({ greetDM: true, greetDMMsg: newMsg });
            return await sock.sendMessage(jid, {
                text: `✅ *Greet message updated:*\n"${newMsg}"\n\n_Greet DM has been automatically enabled._`
            }, { quoted: msg });
        }

        // ── .greet clear ──────────────────────────────────────────────────────
        if (sub === "clear") {
            const count = greetedUsers.length;
            jsonStore.set("greeted_users", []);
            return await sock.sendMessage(jid, {
                text: `🗑️ *Greet memory cleared!*\n\n_${count} contact(s) removed from memory._\n_Everyone will receive a greeting the next time they message you._`
            }, { quoted: msg });
        }

        // ── Unknown sub-command ───────────────────────────────────────────────
        return await sock.sendMessage(jid, {
            text: `⚠️ Unknown option. Use:\n▸ \`.greet on\`\n▸ \`.greet off\`\n▸ \`.greet set <message>\`\n▸ \`.greet clear\``
        }, { quoted: msg });
    }
};
