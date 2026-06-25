const { getBotSettings } = require("../database/settings");

/**
 * Bridge between Database and the rest of the bot.
 * This file stays compatible with your existing commands
 * but now pulls data from SQLite instead of a JSON file.
 */

const defaultSettings = { 
    publicMode: true,
    antiLink: false,
    antiTag: false,
    antiBadword: false,
    antiSpam: true,
    antiDelete: true,
    antiEdit: true,
    antiCall: false,
    statusAntiDelete: false,
    autoDelete: false,
    autoDeleteTime: 30000,
    autoViewStatus: true,
    autoLikeStatus: true,
    autoReplyStatus: false,
    statusReplyText: 'Nice status! ✨',
    statusLikeEmojis: '❤️,✨,🔥,🙌,👍,⭐,💥,🎉,💯,😎,🤩,😍,👏',
    autoRead: false,
    autoBio: false,
    dmPresence: false,
    groupPresence: false,
    chatbotAI: false,
    greetDM: false,
    greetDMMsg: 'Hello, how can i help you today!',
    autoReactDM: false,
    autoReactGrp: false,
    welcome: false,
    goodbye: false,
    welcomeMsg: 'Hi @user, welcome to *@group*! 👋',
    goodbyeMsg: 'Goodbye @user, we hope to see you back soon! 😢',
    antiDeleteNotification: '🕵️ *Nexus Anti-Delete Update*',
    footer: '© Nexus-1MD',
    ownerNumber: '',
    lockedCommands: '',
    botName: 'Nexus-MD',
    device: 'Android',
    prefix: '.',
    packName: 'Nexus-MD',
    author: 'White Wizard',
    timezone: 'Africa/Nairobi',
    botImage: 'Default',
    hideViewChannel: false,
    menuStyle: 1,
    antiLinkGlobal: 'off',
    antiLinkLimit: 3,
    antiStatusMentionGlobal: 'off',
    antiStatusMentionLimit: 3
};

// We keep a cache for performance so we don't hit the DB for EVERY message
let settingsCache = null;

const loadSettings = async () => {
    settingsCache = await getBotSettings();
    if (settingsCache) {
        // Enforce defaults for all properties if they are null or undefined
        let needsUpdate = false;
        const updates = {};
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            if (settingsCache[key] === null || settingsCache[key] === undefined) {
                updates[key] = defaultValue;
                settingsCache[key] = defaultValue;
                if (settingsCache.dataValues) {
                    settingsCache.dataValues[key] = defaultValue;
                }
                needsUpdate = true;
            }
        }
        if (needsUpdate) {
            try {
                if (typeof settingsCache.update === "function") {
                    await settingsCache.update(updates);
                } else if (typeof settingsCache.save === "function") {
                    await settingsCache.save();
                }
            } catch (e) {
                console.error("⚠️ Failed to update setting defaults:", e.message);
            }
            console.log("✅ Settings cache updated and enforced from Database.");
        }
    }
    return settingsCache;
};


const getSettings = () => {
    // If cache is empty (usually at startup), we return defaults
    return settingsCache || { ...defaultSettings };
};

const updateSettings = async (updates) => {
    if (!settingsCache) await loadSettings();
    if (settingsCache) {
        await settingsCache.update(updates);
    }
    return settingsCache;
};

module.exports = { 
    getSettings, 
    updateSettings,
    loadSettings,
    defaultSettings
};
