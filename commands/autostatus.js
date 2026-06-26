const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "autostatus",
    aliases: ["stat", "autostat"],
    description: "Manage automatic status viewing, liking, and replying",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args } = ctx;
        const settings = getSettings();

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
            
            dashboard += `💡 *Usage:* \`.autostatus <number>\` to toggle.\n`;
            dashboard += `💡 *Update Detail:* \`.autostatus setreply <text>\` or \`.autostatus setemojis <e1,e2,...>\`\n`;
            dashboard += `💡 *Subcommands:* \`.autostatus view on/off\`, \`.autostatus react on/off\`, \`.autostatus reply on/off\``;
            
            return await sock.sendMessage(jid, { text: dashboard });
        }

        const action = args[0].toLowerCase();

        if (action === "setreply") {
            const text = args.slice(1).join(" ");
            if (!text) return await sock.sendMessage(jid, { text: "⚠️ Please provide the reply text." });
            settings.statusReplyText = text;
            await updateSettings(settings);
            return await sock.sendMessage(jid, { text: `✅ *Auto-Reply Text Updated*\n\nNew: ${text}` });
        }

        if (action === "setemojis") {
            const emojis = args.slice(1).join("");
            if (!emojis) return await sock.sendMessage(jid, { text: "⚠️ Please provide some emojis (comma separated)." });
            settings.statusLikeEmojis = emojis;
            await updateSettings(settings);
            return await sock.sendMessage(jid, { text: `✅ *Auto-Like Emojis Updated*\n\nNew list: ${emojis}` });
        }

        if (action === "view") {
            const state = args[1]?.toLowerCase() === "on" ? true : args[1]?.toLowerCase() === "off" ? false : !settings.autoViewStatus;
            settings.autoViewStatus = state;
            await updateSettings(settings);
            return await sock.sendMessage(jid, { text: `✅ *Auto View Status* is now ${state ? "ON" : "OFF"}` });
        }

        if (action === "react" || action === "like") {
            const state = args[1]?.toLowerCase() === "on" ? true : args[1]?.toLowerCase() === "off" ? false : !settings.autoLikeStatus;
            settings.autoLikeStatus = state;
            await updateSettings(settings);
            return await sock.sendMessage(jid, { text: `✅ *Auto Like/React Status* is now ${state ? "ON" : "OFF"}` });
        }

        if (action === "reply") {
            const state = args[1]?.toLowerCase() === "on" ? true : args[1]?.toLowerCase() === "off" ? false : !settings.autoReplyStatus;
            settings.autoReplyStatus = state;
            await updateSettings(settings);
            return await sock.sendMessage(jid, { text: `✅ *Auto Reply Status* is now ${state ? "ON" : "OFF"}` });
        }

        // Toggle logic (numeric shortcuts)
        const choice = parseInt(args[0]);
        let msg = "";

        switch (choice) {
            case 1: settings.autoViewStatus = !settings.autoViewStatus; msg = `Auto-View is now ${settings.autoViewStatus ? "ON" : "OFF"}`; break;
            case 2: settings.autoLikeStatus = !settings.autoLikeStatus; msg = `Auto-Like is now ${settings.autoLikeStatus ? "ON" : "OFF"}`; break;
            case 3: settings.autoReplyStatus = !settings.autoReplyStatus; msg = `Auto-Reply is now ${settings.autoReplyStatus ? "ON" : "OFF"}`; break;
            default:
                return await sock.sendMessage(jid, { text: "⚠️ Invalid choice. Use numbers 1-3, subcommands (view/react/reply), or 'setreply'/'setemojis'." });
        }

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Auto-Status Updated*\n\n${msg}` });
    }
};
