const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

const BadwordDB = sequelize.define('badword', {
    word: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    timestamps: true
});

module.exports = {
    BadwordDB,
    initBadwordDB: async () => await BadwordDB.sync({ alter: true }),
    
    addBadword: async (word) => {
        return await BadwordDB.findOrCreate({ where: { word: word.toLowerCase() } });
    },
    
    removeBadword: async (word) => {
        return await BadwordDB.destroy({ where: { word: word.toLowerCase() } });
    },
    
    getBadwords: async () => {
        const words = await BadwordDB.findAll();
        return words.map(w => w.word);
    }
};
