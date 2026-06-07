const { getSettings, updateSettings } = require("../lib/settings");

module.exports = {
    name: "settings",
    aliases: ["config", "conf"],
    description: "Manage bot configurations and automation",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args } = ctx;
        const settings = getSettings();

        // If no args, show the dashboard
        if (args.length === 0) {
            const on = "✅ ON";
            const off = "❌ OFF";
            
            let dashboard = `🤖 *NEXUS-1MD CONFIGURATION*\n\n`;
            dashboard += `1. *Bot Config* — ${settings.publicMode ? "Public" : "Private"}\n`;
            dashboard += `2. *Anti-Link* — ${settings.antiLink ? on : off}\n`;
            dashboard += `3. *Anti-Badword* — ${settings.antiBadword ? on : off}\n`;
            dashboard += `4. *Anti-Spam* — ${settings.antiSpam ? on : off}\n`;
            dashboard += `5. *Anti-Delete* — ${settings.antiDelete ? on : off}\n`;
            dashboard += `6. *Anti-Edit* — ${settings.antiEdit ? on : off}\n`;
            dashboard += `7. *Status Anti-Delete* — ${settings.statusAntiDelete ? on : off}\n`;
            dashboard += `8. *Anti-Call* — ${settings.antiCall ? on : off}\n`;
            dashboard += `9. *Auto Welcome* — ${settings.welcome ? on : off}\n`;
            dashboard += `10. *Auto Goodbye* — ${settings.goodbye ? on : off}\n`;
            dashboard += `11. *Auto-Delete* — ${settings.autoDelete ? on : off}\n`;
            dashboard += `12. *Auto View Status* — ${settings.autoViewStatus ? on : off}\n`;
            dashboard += `13. *Auto Status Like* — ${settings.autoLikeStatus ? on : off}\n`;
            dashboard += `14. *Chatbot (AI)* — ${settings.chatbotAI ? on : off}\n`;
            dashboard += `15. *Greet DM* — ${settings.greetDM ? on : off}\n`;

            
            dashboard += `\n💡 *Tip:* Use \`.settings <number>\` to toggle.\nExample: \`.settings 10\` for Auto-Delete.`;
            
            return await sock.sendMessage(jid, { text: dashboard });
        }

        // Toggle logic based on number
        const choice = parseInt(args[0]);
        let msg = "";

        switch (choice) {
            case 1: settings.publicMode = !settings.publicMode; msg = `Public Mode is now ${settings.publicMode ? "ON" : "OFF"}`; break;
            case 2: settings.antiLink = !settings.antiLink; msg = `Anti-Link is now ${settings.antiLink ? "ON" : "OFF"}`; break;
            case 3: settings.antiBadword = !settings.antiBadword; msg = `Anti-Badword is now ${settings.antiBadword ? "ON" : "OFF"}`; break;
            case 4: settings.antiSpam = !settings.antiSpam; msg = `Anti-Spam is now ${settings.antiSpam ? "ON" : "OFF"}`; break;
            case 5: settings.antiDelete = !settings.antiDelete; msg = `Anti-Delete is now ${settings.antiDelete ? "ON" : "OFF"}`; break;
            case 6: settings.antiEdit = !settings.antiEdit; msg = `Anti-Edit is now ${settings.antiEdit ? "ON" : "OFF"}`; break;
            case 7: settings.statusAntiDelete = !settings.statusAntiDelete; msg = `Status Anti-Delete is now ${settings.statusAntiDelete ? "ON" : "OFF"}`; break;
            case 8: settings.antiCall = !settings.antiCall; msg = `Anti-Call is now ${settings.antiCall ? "ON" : "OFF"}`; break;
            case 9: settings.welcome = !settings.welcome; msg = `Auto Welcome is now ${settings.welcome ? "ON" : "OFF"}`; break;
            case 10: settings.goodbye = !settings.goodbye; msg = `Auto Goodbye is now ${settings.goodbye ? "ON" : "OFF"}`; break;
            case 11: settings.autoDelete = !settings.autoDelete; msg = `Auto-Delete is now ${settings.autoDelete ? "ON" : "OFF"}`; break;
            case 12: settings.autoViewStatus = !settings.autoViewStatus; msg = `Auto View Status is now ${settings.autoViewStatus ? "ON" : "OFF"}`; break;
            case 13: settings.autoLikeStatus = !settings.autoLikeStatus; msg = `Auto Status Like is now ${settings.autoLikeStatus ? "ON" : "OFF"}`; break;
            case 14: settings.chatbotAI = !settings.chatbotAI; msg = `Chatbot AI is now ${settings.chatbotAI ? "ON" : "OFF"}`; break;
            case 15: settings.greetDM = !settings.greetDM; msg = `Greet DM is now ${settings.greetDM ? "ON" : "OFF"}`; break;
            default:
                return await sock.sendMessage(jid, { text: "⚠️ Invalid choice. Use numbers 1-15." });

        }

        await updateSettings(settings);
        await sock.sendMessage(jid, { text: `✅ *Settings Updated*\n\n${msg}` });
    }
};
