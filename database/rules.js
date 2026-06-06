const { DataTypes } = require('sequelize');
const { sequelize, isOnline } = require('../lib/db');
const jsonStore = require('../lib/jsonStore');

let RulesDB = null;

if (sequelize) {
    RulesDB = sequelize.define('rules', {
        groupId: { type: DataTypes.STRING, allowNull: false, unique: true },
        rulesText: { type: DataTypes.TEXT, defaultValue: 'No rules set for this group yet.' }
    }, {
        timestamps: true
    });
}

module.exports = {
    RulesDB,
    initRulesDB: async () => {
        if (RulesDB) await RulesDB.sync({ alter: true });
    },
    
    setRules: async (groupId, text) => {
        if (RulesDB && isOnline()) {
            const [rule] = await RulesDB.findOrCreate({
                where: { groupId },
                defaults: { rulesText: text }
            });
            rule.rulesText = text;
            await rule.save();
            return rule;
        }
        // Fallback to JSON
        jsonStore.set(`rules_${groupId}`, text);
        return { rulesText: text };
    },
    
    getRules: async (groupId) => {
        if (RulesDB && isOnline()) {
            try {
                const rule = await RulesDB.findOne({ where: { groupId } });
                return rule ? rule.rulesText : 'No rules set for this group yet.';
            } catch (e) {
                return jsonStore.get(`rules_${groupId}`, 'No rules set for this group yet.');
            }
        }
        return jsonStore.get(`rules_${groupId}`, 'No rules set for this group yet.');
    }
};
