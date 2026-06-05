const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

const RulesDB = sequelize.define('rules', {
    groupId: { type: DataTypes.STRING, allowNull: false, unique: true },
    rulesText: { type: DataTypes.TEXT, defaultValue: 'No rules set for this group yet.' }
}, {
    timestamps: true
});

module.exports = {
    RulesDB,
    initRulesDB: async () => await RulesDB.sync({ alter: true }),
    
    setRules: async (groupId, text) => {
        const [rule] = await RulesDB.findOrCreate({
            where: { groupId },
            defaults: { rulesText: text }
        });
        rule.rulesText = text;
        await rule.save();
        return rule;
    },
    
    getRules: async (groupId) => {
        const rule = await RulesDB.findOne({ where: { groupId } });
        return rule ? rule.rulesText : 'No rules set for this group yet.';
    }
};
