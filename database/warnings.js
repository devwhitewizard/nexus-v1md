const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

const WarningDB = sequelize.define('warning', {
    userId: { type: DataTypes.STRING, allowNull: false },
    groupId: { type: DataTypes.STRING, allowNull: false },
    count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    timestamps: true
});

module.exports = {
    WarningDB,
    initWarningDB: async () => await WarningDB.sync({ alter: true }),
    
    addWarning: async (userId, groupId) => {
        const [warn] = await WarningDB.findOrCreate({
            where: { userId, groupId },
            defaults: { count: 0 }
        });
        warn.count += 1;
        await warn.save();
        return warn.count;
    },
    
    getWarnings: async (userId, groupId) => {
        const warn = await WarningDB.findOne({ where: { userId, groupId } });
        return warn ? warn.count : 0;
    },
    
    clearWarnings: async (userId, groupId) => {
        return await WarningDB.destroy({ where: { userId, groupId } });
    }
};
