const { DataTypes } = require('sequelize');
const { sequelize, isOnline } = require('../lib/db');
const jsonStore = require('../lib/jsonStore');

let WarningDB = null;

if (sequelize) {
    WarningDB = sequelize.define('warning', {
        userId: { type: DataTypes.STRING, allowNull: false },
        groupId: { type: DataTypes.STRING, allowNull: false },
        count: { type: DataTypes.INTEGER, defaultValue: 0 }
    }, {
        timestamps: true
    });
}

module.exports = {
    WarningDB,
    initWarningDB: async () => {
        if (WarningDB) await WarningDB.sync({ alter: true });
    },
    
    addWarning: async (userId, groupId) => {
        if (WarningDB && isOnline()) {
            const [warn] = await WarningDB.findOrCreate({
                where: { userId, groupId },
                defaults: { count: 0 }
            });
            warn.count += 1;
            await warn.save();
            return warn.count;
        }
        // Fallback to JSON
        const key = `warn_${userId}_${groupId}`;
        let count = jsonStore.get(key, 0);
        count += 1;
        jsonStore.set(key, count);
        return count;
    },
    
    getWarnings: async (userId, groupId) => {
        if (WarningDB && isOnline()) {
            try {
                const warn = await WarningDB.findOne({ where: { userId, groupId } });
                return warn ? warn.count : 0;
            } catch (e) {
                return jsonStore.get(`warn_${userId}_${groupId}`, 0);
            }
        }
        return jsonStore.get(`warn_${userId}_${groupId}`, 0);
    },
    
    clearWarnings: async (userId, groupId) => {
        if (WarningDB && isOnline()) {
            return await WarningDB.destroy({ where: { userId, groupId } });
        }
        // Fallback to JSON
        jsonStore.set(`warn_${userId}_${groupId}`, 0);
        return true;
    }
};
