const { Sequelize } = require("sequelize");
const path = require("path");
const jsonStore = require("./jsonStore");

const dbUrl = process.env.DATABASE_URL;

// Global state tracking
let isDatabaseOnline = false;
let sequelize = null;

// Initialize Sequelize ONLY if needed
if (dbUrl && !process.env.FORCE_SQLITE) {
    sequelize = new Sequelize(dbUrl, {
        logging: false,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false },
            connectTimeout: 5000 
        },
        retry: { max: 0 } 
    });
}

const initDb = async () => {
    if (sequelize) {
        try {
            await sequelize.authenticate();
            console.log("🗄️ Primary database connected successfully.");
            await sequelize.sync({ alter: true });
            console.log("✅ Database models synchronized.");
            isDatabaseOnline = true;
        } catch (error) {
            console.warn("⚠️ Primary database failed. Using Binary-Free JSON Fallback.");
            isDatabaseOnline = false;
        }
    } else {
        console.log("🗄️ No DATABASE_URL found. Using Binary-Free JSON Fallback.");
        isDatabaseOnline = false;
    }
};

module.exports = { 
    sequelize, 
    initDb, 
    isOnline: () => isDatabaseOnline 
};