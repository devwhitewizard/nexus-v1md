const { getSettings, updateSettings } = require("../../lib/settings");

module.exports = {
    name: "autostatus",
    aliases: ["stat", "autostat", "setstatusemoji", "statusemoji", "statusemojis"],
    description: "Manage automatic status viewing, liking, and custom reaction emojis",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg, commandName } = ctx;
        const settings = getSettings();

        // 1. Direct command alias for setting status emojis (.statusemoji 🔥,❤️,✨)
        if (commandName && (commandName.includes("emoji") || commandName === "setstatusemoji")) {
            const emojiInput = args.join(" ").trim();
            if (!emojiInput) {
                return await sock.sendMessage(jid, {
                    text: `📌 *Current Status Reaction Emojis:* ${settings.statusLikeEmojis}\n\n💡 *Usage:* \`.statusemoji 🔥,❤️,✨,😎\` to set your own custom emojis.`
                }, { quoted: msg });
            }
            await updateSettings({ statusLikeEmojis: emojiInput });
            return await sock.sendMessage(jid, {
                text: `✅ *Status Reaction Emojis Updated!*\n\nNew reaction list: ${emojiInput}`
            }, { quoted: msg });
        }

        if (args.length === 0) {
            const on = "✅ ON";
            const off = "❌ OFF";

            let dashboard = `💠 *NEXUS-1MD AUTO-STATUS DASHBOARD*\n\n`;
            dashboard += `1. *Auto View* — ${settings.autoViewStatus ? on : off}\n`;
            dashboard += `2. *Auto Like* — ${settings.autoLikeStatus ? on : off}\n`;
            dashboard += `3. *Auto Reply* — ${settings.autoReplyStatus ? on : off}\n\n`;

            dashboard += `📊 *Configurations:*\n`;
            dashboard += `◽ *Reply Text:* ${settings.statusReplyText}\n`;
            dashboard += `◽ *Emojis:* ${settings.statusLikeEmojis}\n\n`;

            dashboard += `💡 *Set Custom Emojis:* \`.statusemoji 🔥,❤️,✨\`\n`;
            dashboard += `💡 *Set Reply Text:* \`.autostatus setreply <text>\`\n`;
            dashboard += `💡 *Toggle Features:* \`.autostatus 1\` (View), \`.autostatus 2\` (Like), \`.autostatus 3\` (Reply)`;

            return await sock.sendMessage(jid, { text: dashboard }, { quoted: msg });
        }

        const action = args[0].toLowerCase();

        if (action === "setreply") {
            const text = args.slice(1).join(" ");
            if (!text) return await sock.sendMessage(jid, { text: "⚠️ Please provide the reply text." }, { quoted: msg });
            await updateSettings({ statusReplyText: text });
            return await sock.sendMessage(jid, { text: `✅ *Auto-Reply Text Updated*\n\nNew: ${text}` }, { quoted: msg });
        }

        if (action === "setemojis" || action === "emojis" || action === "emoji") {
            const emojis = args.slice(1).join(" ");
            if (!emojis) return await sock.sendMessage(jid, { text: "⚠️ Please provide your emojis (e.g. `.autostatus setemojis 🔥,❤️,✨`)." }, { quoted: msg });
            await updateSettings({ statusLikeEmojis: emojis });
            return await sock.sendMessage(jid, { text: `✅ *Auto-Like Emojis Updated*\n\nNew list: ${emojis}` }, { quoted: msg });
        }

        if (action === "view") {
            const state = args[1]?.toLowerCase() === "on" ? true : args[1]?.toLowerCase() === "off" ? false : !settings.autoViewStatus;
            await updateSettings({ autoViewStatus: state });
            return await sock.sendMessage(jid, { text: `✅ *Auto View Status* is now ${state ? "ON" : "OFF"}` }, { quoted: msg });
        }

        if (action === "react" || action === "like") {
            const state = args[1]?.toLowerCase() === "on" ? true : args[1]?.toLowerCase() === "off" ? false : !settings.autoLikeStatus;
            await updateSettings({ autoLikeStatus: state });
            return await sock.sendMessage(jid, { text: `✅ *Auto Like/React Status* is now ${state ? "ON" : "OFF"}` }, { quoted: msg });
        }

        if (action === "reply") {
            const state = args[1]?.toLowerCase() === "on" ? true : args[1]?.toLowerCase() === "off" ? false : !settings.autoReplyStatus;
            await updateSettings({ autoReplyStatus: state });
            return await sock.sendMessage(jid, { text: `✅ *Auto Reply Status* is now ${state ? "ON" : "OFF"}` }, { quoted: msg });
        }

        // Toggle logic (numeric shortcuts)
        const choice = parseInt(args[0], 10);
        let msgText = "";

        switch (choice) {
            case 1:
                settings.autoViewStatus = !settings.autoViewStatus;
                await updateSettings({ autoViewStatus: settings.autoViewStatus });
                msgText = `Auto-View is now ${settings.autoViewStatus ? "ON" : "OFF"}`;
                break;
            case 2:
                settings.autoLikeStatus = !settings.autoLikeStatus;
                await updateSettings({ autoLikeStatus: settings.autoLikeStatus });
                msgText = `Auto-Like is now ${settings.autoLikeStatus ? "ON" : "OFF"}`;
                break;
            case 3:
                settings.autoReplyStatus = !settings.autoReplyStatus;
                await updateSettings({ autoReplyStatus: settings.autoReplyStatus });
                msgText = `Auto-Reply is now ${settings.autoReplyStatus ? "ON" : "OFF"}`;
                break;
            default:
                return await sock.sendMessage(jid, { text: "⚠️ Invalid choice. Use `.statusemoji 🔥,❤️,✨` or `.autostatus` to view options." }, { quoted: msg });
        }

        await sock.sendMessage(jid, { text: `✅ *Auto-Status Updated*\n\n${msgText}` }, { quoted: msg });
    }
};
