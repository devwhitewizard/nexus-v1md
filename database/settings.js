const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

let SettingsDB = null;

if (sequelize) {
    SettingsDB = sequelize.define('settings', {
        // 1. Bot Mode
        publicMode: { type: DataTypes.BOOLEAN, defaultValue: true },
        
        // 2. Automation Toggles
        antiLink: { type: DataTypes.BOOLEAN, defaultValue: false },
        antiTag: { type: DataTypes.BOOLEAN, defaultValue: false },
        antiBadword: { type: DataTypes.BOOLEAN, defaultValue: false },
        antiSpam: { type: DataTypes.BOOLEAN, defaultValue: true },
        antiDelete: { type: DataTypes.BOOLEAN, defaultValue: true },
        antiEdit: { type: DataTypes.BOOLEAN, defaultValue: true },
        antiCall: { type: DataTypes.BOOLEAN, defaultValue: false },

        statusAntiDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
        autoDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
        autoDeleteTime: { type: DataTypes.INTEGER, defaultValue: 30000 },
        
        // 3. Status/Presence Expansion
        autoViewStatus: { type: DataTypes.BOOLEAN, defaultValue: true },
        autoLikeStatus: { type: DataTypes.BOOLEAN, defaultValue: true },
        autoReplyStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
        statusReplyText: { type: DataTypes.STRING, defaultValue: 'Nice status! ✨' },
        statusLikeEmojis: { type: DataTypes.STRING, defaultValue: '❤️,✨,🔥,🙌,👍,⭐,💥,🎉,💯,😎,🤩,😍,👏' },
        autoRead: { type: DataTypes.BOOLEAN, defaultValue: false },
        autoBio: { type: DataTypes.BOOLEAN, defaultValue: false },
        
        // 4. Presence & AI
        dmPresence: { type: DataTypes.BOOLEAN, defaultValue: false },
        groupPresence: { type: DataTypes.BOOLEAN, defaultValue: false },
        chatbotAI: { type: DataTypes.BOOLEAN, defaultValue: false },
        greetDM: { type: DataTypes.BOOLEAN, defaultValue: false },
        greetDMMsg: { type: DataTypes.STRING, defaultValue: 'Hello World' },
        autoReactDM: { type: DataTypes.BOOLEAN, defaultValue: false },
        autoReactGrp: { type: DataTypes.BOOLEAN, defaultValue: false },
        
        // 5. Group Events (Welcome/Goodbye)
        welcome: { type: DataTypes.BOOLEAN, defaultValue: false },
        goodbye: { type: DataTypes.BOOLEAN, defaultValue: false },
        welcomeMsg: { 
            type: DataTypes.STRING, 
            defaultValue: 'Hi @user, welcome to *@group*! 👋' 
        },
        goodbyeMsg: { 
            type: DataTypes.STRING, 
            defaultValue: 'Goodbye @user, we hope to see you back soon! 😢' 
        },

        // 6. Custom Content
        antiDeleteNotification: { 
            type: DataTypes.STRING, 
            defaultValue: '🕵️ *Nexus Anti-Delete Update*' 
        },
        footer: { type: DataTypes.STRING, defaultValue: '© Nexus-1MD' },
        ownerNumber: { type: DataTypes.STRING, defaultValue: '' },
        lockedCommands: { type: DataTypes.TEXT, defaultValue: '' },
        botName: { type: DataTypes.STRING, defaultValue: 'Nexus-MD' },
        device: { type: DataTypes.STRING, defaultValue: 'Android' },
        prefix: { type: DataTypes.STRING, defaultValue: '.' },
        packName: { type: DataTypes.STRING, defaultValue: 'BWM-XMD' },
        author: { type: DataTypes.STRING, defaultValue: 'Ibrahim Adams' },
        timezone: { type: DataTypes.STRING, defaultValue: 'Africa/Nairobi' },
        botImage: { type: DataTypes.STRING, defaultValue: 'Default' },
        hideViewChannel: { type: DataTypes.BOOLEAN, defaultValue: false },
        menuStyle: { type: DataTypes.INTEGER, defaultValue: 1 }
    }, {
        timestamps: true
    });
}

/**
 * Initializes the settings record if it doesn't exist
 */
const getBotSettings = async () => {
    const { isOnline } = require('../lib/db');
    const jsonStore = require('../lib/jsonStore');

    const defaults = { 
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
        greetDMMsg: 'Hello World',
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
        packName: 'BWM-XMD',
        author: 'Ibrahim Adams',
        timezone: 'Africa/Nairobi',
        botImage: 'Default',
        hideViewChannel: false,
        menuStyle: 1
    };

    if (!isOnline() || !SettingsDB) {
        const [settings] = await jsonStore.findOrCreate({
            where: { id: 1 },
            defaults
        });
        return settings;
    }

    try {
        const [settings] = await SettingsDB.findOrCreate({
            where: { id: 1 },
            defaults
        });
        return settings;
    } catch (e) {
        console.error("❌ getBotSettings Fallback:", e.message);
        // Emergency fallback to JSON store if DB sync/find fails
        const [settings] = await jsonStore.findOrCreate({ where: { id: 1 }, defaults });
        return settings;
    }
};

module.exports = { 
    SettingsDB, 
    getBotSettings,
    initSettingsDB: async () => { if(SettingsDB) await SettingsDB.sync() }
};
