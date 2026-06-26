const { updateSettings, defaultSettings } = require("../lib/settings");

module.exports = {
    name: "syncsettings",
    aliases: ["syncsetting", "resetsettings", "resetsetting"],
    description: "Sync or reset settings to default values",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        if (!args[0]) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:*\n▸ `.syncsettings all` — Reset all settings\n▸ `.syncsettings <setting_name>` — Reset a specific setting" 
            }, { quoted: msg });
        }

        const input = args[0].toLowerCase();
        
        if (input === "all") {
            await updateSettings(defaultSettings);
            return await sock.sendMessage(jid, { 
                text: "✅ All settings have been reset to default values." 
            }, { quoted: msg });
        }

        // Mapping for specific settings
        const nameMap = {
            publicmode: "publicMode", public: "publicMode",
            antilink: "antiLink",
            antitag: "antiTag",
            antibadword: "antiBadword",
            antispam: "antiSpam",
            antidelete: "antiDelete",
            antiedit: "antiEdit",
            anticall: "antiCall",
            statusantidelete: "statusAntiDelete", statusdelete: "statusAntiDelete",
            autodelete: "autoDelete",
            autoviewstatus: "autoViewStatus", autoview: "autoViewStatus",
            autolikestatus: "autoLikeStatus", autolike: "autoLikeStatus", statusreact: "autoLikeStatus",
            autoreplystatus: "autoReplyStatus", autoreply: "autoReplyStatus",
            autoread: "autoRead",
            autotype: "autoType",
            autorecord: "autoRecord",
            alwaysonline: "alwaysOnline", online: "alwaysOnline",
            autobio: "autoBio",
            dmpresence: "dmPresence",
            grouppresence: "groupPresence", grppresence: "groupPresence",
            chatbotai: "chatbotAI", chatbot: "chatbotAI",
            greetdm: "greetDM", greet: "greetDM",
            autoreactdm: "autoReactDM", reactdm: "autoReactDM",
            autoreactgrp: "autoReactGrp", reactgrp: "autoReactGrp", reactgroup: "autoReactGrp",
            welcome: "welcome",
            goodbye: "goodbye"
        };

        const targetKey = nameMap[input];
        if (!targetKey || !(targetKey in defaultSettings)) {
            return await sock.sendMessage(jid, { 
                text: `⚠️ Unknown setting name: \`${args[0]}\`.\nValid names: ${Object.keys(nameMap).join(", ")}` 
            }, { quoted: msg });
        }

        const defaultValue = defaultSettings[targetKey];
        const updates = { [targetKey]: defaultValue };
        await updateSettings(updates);

        return await sock.sendMessage(jid, { 
            text: `✅ Setting *${targetKey}* has been reset to its default value: \`${defaultValue}\`.` 
        }, { quoted: msg });
    }
};
