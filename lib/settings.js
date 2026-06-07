const { getBotSettings } = require("../database/settings");

/**
 * Bridge between Database and the rest of the bot.
 * This file stays compatible with your existing commands
 * but now pulls data from SQLite instead of a JSON file.
 */

// We keep a cache for performance so we don't hit the DB for EVERY message
let settingsCache = null;

const loadSettings = async () => {
    settingsCache = await getBotSettings();
    if (settingsCache) {
        // Enforce defaults for critical safety features if not set
        if (settingsCache.antiDelete === null) settingsCache.antiDelete = true;
        if (settingsCache.antiEdit === null) settingsCache.antiEdit = true;
        await settingsCache.save();
        console.log("✅ Settings cache updated and enforced from Database.");
    }
    return settingsCache;
};


const getSettings = () => {
    // If cache is empty (usually at startup), we return defaults
    // But since the bot is async, loadSettings should be called in index.js
    return settingsCache || { 
        publicMode: false, 
        antiDelete: true,
        antiEdit: true,
        autoViewStatus: true
    };

};

const updateSettings = async (updates) => {
    if (!settingsCache) await loadSettings();
    await settingsCache.update(updates);
    return settingsCache;
};

module.exports = { 
    getSettings, 
    updateSettings,
    loadSettings 
};
