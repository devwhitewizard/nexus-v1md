const { getBotSettings } = require("../database/settings");

/**
 * Bridge between Database and the rest of the bot.
 * This file stays compatible with your existing commands
 * but now pulls data from SQLite instead of a JSON file.
 */

const parseBoolEnv = (val, fallback) => {
    if (val === undefined || val === null || val === "") return fallback;
    const str = val.toString().trim().toLowerCase();
    if (str === "true" || str === "1" || str === "yes" || str === "public" || str === "on") return true;
    if (str === "false" || str === "0" || str === "no" || str === "private" || str === "off") return false;
    return fallback;
};

const parseStrEnv = (val, fallback) => {
    if (val === undefined || val === null || val.toString().trim() === "") return fallback;
    return val.toString().trim();
};

const defaultSettings = { 
    publicMode: parseBoolEnv(process.env.MODE_PUBLIC || process.env.PUBLIC_MODE || process.env.MODE, true),
    antiLink: parseBoolEnv(process.env.ANTI_LINK, false),
    antiTag: parseBoolEnv(process.env.ANTI_TAG, false),
    antiBadword: parseBoolEnv(process.env.ANTI_BADWORD, false),
    antiSpam: parseBoolEnv(process.env.ANTI_SPAM, true),
    antiDelete: parseBoolEnv(process.env.ANTI_DELETE, true),
    antiEdit: parseBoolEnv(process.env.ANTI_EDIT, true),
    antiCall: parseBoolEnv(process.env.ANTI_CALL, false),
    statusAntiDelete: parseBoolEnv(process.env.STATUS_ANTI_DELETE, false),
    autoDelete: parseBoolEnv(process.env.AUTO_DELETE, false),
    autoDeleteTime: parseInt(process.env.AUTO_DELETE_TIME, 10) || 30000,
    autoViewStatus: parseBoolEnv(process.env.AUTO_VIEW_STATUS || process.env.AUTO_STATUS_VIEW, true),
    autoLikeStatus: parseBoolEnv(process.env.AUTO_LIKE_STATUS || process.env.AUTO_STATUS_LIKE, true),
    autoReplyStatus: parseBoolEnv(process.env.AUTO_REPLY_STATUS, false),
    statusReplyText: parseStrEnv(process.env.STATUS_REPLY_TEXT, 'Nice status! ✨'),
    statusLikeEmojis: parseStrEnv(process.env.STATUS_LIKE_EMOJIS, '❤️,✨,🔥,🙌,👍,⭐,💥,🎉,💯,😎,🤩,😍,👏'),
    autoRead: parseBoolEnv(process.env.AUTO_READ, false),
    autoType: parseBoolEnv(process.env.AUTO_TYPE, false),
    autoRecord: parseBoolEnv(process.env.AUTO_RECORD, false),
    alwaysOnline: parseBoolEnv(process.env.ALWAYS_ONLINE, false),
    autoBio: parseBoolEnv(process.env.AUTO_BIO, false),
    dmPresence: parseBoolEnv(process.env.DM_PRESENCE, false),
    groupPresence: parseBoolEnv(process.env.GROUP_PRESENCE, false),
    chatbotAI: parseBoolEnv(process.env.CHATBOT_AI, false),
    greetDM: parseBoolEnv(process.env.GREET_DM, false),
    greetDMMsg: parseStrEnv(process.env.GREET_DM_MSG, 'Hello, how can i help you today!'),
    autoReactDM: parseBoolEnv(process.env.AUTO_REACT_DM, false),
    autoReactGrp: parseBoolEnv(process.env.AUTO_REACT_GRP, false),
    welcome: parseBoolEnv(process.env.WELCOME, false),
    goodbye: parseBoolEnv(process.env.GOODBYE, false),
    welcomeMsg: parseStrEnv(process.env.WELCOME_MSG, 'Hi @user, welcome to *@group*! 👋'),
    goodbyeMsg: parseStrEnv(process.env.GOODBYE_MSG, 'Goodbye @user, we hope to see you back soon! 😢'),
    antiDeleteNotification: parseStrEnv(process.env.ANTI_DELETE_NOTIFICATION, '🕵️ *Nexus Anti-Delete Update*'),
    footer: parseStrEnv(process.env.FOOTER, '© Nexus-MD • Channel: https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02'),
    ownerNumber: parseStrEnv(process.env.OWNER_NUMBER, ''),
    lockedCommands: parseStrEnv(process.env.LOCKED_COMMANDS, ''),
    botName: parseStrEnv(process.env.BOT_NAME, 'Nexus-MD'),
    device: parseStrEnv(process.env.DEVICE, 'Android'),
    prefix: parseStrEnv(process.env.PREFIX, '.'),
    packName: parseStrEnv(process.env.PACK_NAME || process.env.STICKER_PACK, 'Nexus-MD'),
    author: parseStrEnv(process.env.AUTHOR || process.env.STICKER_AUTHOR, 'White Wizard'),
    timezone: parseStrEnv(process.env.TIMEZONE, 'Africa/Nairobi'),
    botImage: parseStrEnv(process.env.BOT_IMAGE, 'Default'),
    hideViewChannel: parseBoolEnv(process.env.HIDE_VIEW_CHANNEL, false),
    menuStyle: parseInt(process.env.MENU_STYLE, 10) || 1,
    antiLinkGlobal: parseStrEnv(process.env.ANTI_LINK_GLOBAL, 'off'),
    antiLinkLimit: parseInt(process.env.ANTI_LINK_LIMIT, 10) || 3,
    antiStatusMentionGlobal: parseStrEnv(process.env.ANTI_STATUS_MENTION_GLOBAL, 'off'),
    antiStatusMentionLimit: parseInt(process.env.ANTI_STATUS_MENTION_LIMIT, 10) || 3,
    groupEventsGlobal: parseBoolEnv(process.env.GROUP_EVENTS_GLOBAL, false),
    eventsPromote: parseBoolEnv(process.env.EVENTS_PROMOTE, false)
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

        // Clean up old BWM / Ibrahim default remnants from SQLite DB
        if (settingsCache.packName && (settingsCache.packName.includes("BWM") || settingsCache.packName.includes("bwm"))) {
            settingsCache.packName = "Nexus-MD";
            updates.packName = "Nexus-MD";
            if (settingsCache.dataValues) {
                settingsCache.dataValues.packName = "Nexus-MD";
            }
            needsUpdate = true;
        }
        if (settingsCache.author && (settingsCache.author.includes("Ibrahim") || settingsCache.author.includes("ibrahim"))) {
            settingsCache.author = "White Wizard";
            updates.author = "White Wizard";
            if (settingsCache.dataValues) {
                settingsCache.dataValues.author = "White Wizard";
            }
            needsUpdate = true;
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
        for (const [key, value] of Object.entries(updates)) {
            settingsCache[key] = value;
            if (settingsCache.dataValues) {
                settingsCache.dataValues[key] = value;
            }
        }
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
