const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

const SettingsDB = sequelize.define('settings', {
    // 1. Bot Mode
    publicMode: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // 2. Automation Toggles
    antiLink: { type: DataTypes.BOOLEAN, defaultValue: false },
    antiTag: { type: DataTypes.BOOLEAN, defaultValue: false },
    antiBadword: { type: DataTypes.BOOLEAN, defaultValue: false },
    antiSpam: { type: DataTypes.BOOLEAN, defaultValue: false },
    antiDelete: { type: DataTypes.BOOLEAN, defaultValue: true },
    antiEdit: { type: DataTypes.BOOLEAN, defaultValue: true },
    antiCall: { type: DataTypes.BOOLEAN, defaultValue: false },

    statusAntiDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoDeleteTime: { type: DataTypes.INTEGER, defaultValue: 30000 },
    
    // 3. Status/Presence Expansion
    autoViewStatus: { type: DataTypes.BOOLEAN, defaultValue: true },
    autoLikeStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoReplyStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
    statusReplyText: { type: DataTypes.STRING, defaultValue: 'Nice status! ✨' },
    statusLikeEmojis: { type: DataTypes.STRING, defaultValue: '❤️,✨,🔥,🙌' },
    autoRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoBio: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // 4. Presence & AI
    dmPresence: { type: DataTypes.BOOLEAN, defaultValue: false },
    groupPresence: { type: DataTypes.BOOLEAN, defaultValue: false },
    chatbotAI: { type: DataTypes.BOOLEAN, defaultValue: false },
    greetDM: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoReactDM: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // 5. Group Events (Welcome/Goodbye)
    welcome: { type: DataTypes.BOOLEAN, defaultValue: true },
    goodbye: { type: DataTypes.BOOLEAN, defaultValue: true },
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
    lockedCommands: { type: DataTypes.TEXT, defaultValue: '' }
}, {
    timestamps: true
});

/**
 * Initializes the settings record if it doesn't exist
 */
const getBotSettings = async () => {
    const { isOnline } = require('../lib/db');
    const jsonStore = require('../lib/jsonStore');

    if (!isOnline()) {
        const [settings] = await jsonStore.findOrCreate({
            where: { id: 1 },
            defaults: { 
                publicMode: false,
                antiDelete: true,
                autoViewStatus: true,
                lockedCommands: ""
            }
        });
        return settings;
    }

    try {
        const [settings] = await SettingsDB.findOrCreate({
            where: { id: 1 },
            defaults: { 
                publicMode: false,
                antiDelete: true,
                autoViewStatus: true,
                lockedCommands: ""
            }
        });
        return settings;
    } catch (e) {
        console.error("❌ getBotSettings Error:", e);
        return null;
    }
};

module.exports = { 
    SettingsDB, 
    getBotSettings,
    initSettingsDB: async () => await SettingsDB.sync()
};
