const { DataTypes } = require('sequelize');
const { sequelize, isOnline } = require('../nexus/db');
const jsonStore = require('../nexus/jsonStore');

let BadwordDB = null;

if (sequelize) {
    BadwordDB = sequelize.define('badword', {
        word: { type: DataTypes.STRING, allowNull: false, unique: true }
    }, {
        timestamps: true
    });
}

module.exports = {
    BadwordDB,
    initBadwordDB: async () => {
        if (BadwordDB) await BadwordDB.sync({ alter: true });
    },
    
    addBadword: async (word) => {
        if (BadwordDB && isOnline()) {
            return await BadwordDB.findOrCreate({ where: { word: word.toLowerCase() } });
        }
        // Fallback to JSON
        const badwords = jsonStore.get("badwords", []);
        if (!badwords.includes(word.toLowerCase())) {
            badwords.push(word.toLowerCase());
            jsonStore.set("badwords", badwords);
        }
        return true;
    },
    
    removeBadword: async (word) => {
        if (BadwordDB && isOnline()) {
            return await BadwordDB.destroy({ where: { word: word.toLowerCase() } });
        }
        // Fallback to JSON
        let badwords = jsonStore.get("badwords", []);
        badwords = badwords.filter(w => w !== word.toLowerCase());
        jsonStore.set("badwords", badwords);
        return true;
    },
    
    getBadwords: async () => {
        if (BadwordDB && isOnline()) {
            try {
                const words = await BadwordDB.findAll();
                return words.map(w => w.word);
            } catch (e) {
                return jsonStore.get("badwords", []);
            }
        }
        return jsonStore.get("badwords", []);
    }
};
