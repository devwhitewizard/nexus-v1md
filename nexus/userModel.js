const { DataTypes } = require("sequelize");
const { sequelize, isOnline } = require("./db");
const jsonStore = require("./jsonStore");

// Define User Model
let User = null;

if (sequelize) {
    User = sequelize.define("User", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        coins: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        inventory: {
            type: DataTypes.TEXT, // Store as JSON string
            defaultValue: "[]",
        },
        lastDaily: { type: DataTypes.DATE, defaultValue: 0 },
        lastWeekly: { type: DataTypes.DATE, defaultValue: 0 },
        lastMonthly: { type: DataTypes.DATE, defaultValue: 0 },
        lastWork: { type: DataTypes.DATE, defaultValue: 0 },
        lastCrime: { type: DataTypes.DATE, defaultValue: 0 },
        lastRob: { type: DataTypes.DATE, defaultValue: 0 },
    }, {
        timestamps: true, // Automatically adds createdAt and updatedAt
    });
}

// Helper functions (keeping the same API for the rest of the bot)
const getUser = async (id) => {
    if (User && isOnline()) {
        try {
            const [user, created] = await User.findOrCreate({
                where: { id: id },
                defaults: { xp: 0, level: 1, coins: 0, inventory: "[]" }
            });
            return user;
        } catch (error) {
            console.error("❌ getUser Error:", error);
        }
    }
    
    // Fallback to JSON
    const key = `user_${id}`;
    let data = jsonStore.get(key);
    if (!data) {
        data = { id, xp: 0, level: 1, coins: 0, inventory: "[]" };
        jsonStore.set(key, data);
    }
    
    // Polyfill the sequelize methods for commands
    return {
        ...data,
        dataValues: data,
        update: async (updates) => {
            const cleanUpdates = {};
            for (const k in updates) {
                if (k !== "dataValues" && k !== "update" && k !== "save" && typeof updates[k] !== "function") {
                    cleanUpdates[k] = updates[k];
                }
            }
            Object.assign(data, cleanUpdates);
            jsonStore.set(key, data);
            return data;
        },
        save: async () => {
            jsonStore.set(key, data);
            return data;
        }
    };
};

const xpCooldowns = new Map();

const addXP = async (id, amount) => {
    const now = Date.now();
    const lastXPTime = xpCooldowns.get(id) || 0;
    if (now - lastXPTime < 60000) { // 60s cooldown to throttle database reads/writes
        return null;
    }
    xpCooldowns.set(id, now);

    const user = await getUser(id);
    if (user) {
        let currentXP = user.xp || 0;
        let currentLevel = user.level || 1;
        
        currentXP += amount;
        const nextLevelXP = currentLevel * 100;
        if (currentXP >= nextLevelXP) {
            currentLevel += 1;
        }
        
        await user.update({ xp: currentXP, level: currentLevel });
        return user.dataValues;
    }
};

const addCoins = async (id, amount) => {
    const user = await getUser(id);
    if (user) {
        let currentCoins = user.coins || 0;
        currentCoins += amount;
        await user.update({ coins: currentCoins });
        return user.dataValues;
    }
};

const getUserCount = async () => {
    if (User && isOnline()) {
        try {
            return await User.count();
        } catch (e) {
            // Fallback on error
        }
    }
    
    // Scan JSON store for keys starting with "user_"
    const allData = jsonStore.getAll();
    return Object.keys(allData).filter(k => k.startsWith("user_")).length;
};

module.exports = { User, getUser, addXP, addCoins, getUserCount };