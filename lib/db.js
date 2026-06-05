const { Sequelize } = require("sequelize");
const path = require("path");

const dbUrl = process.env.DATABASE_URL;

// Initialize Sequelize
let sequelize;
const dbUrl = process.env.DATABASE_URL;

if (dbUrl && !process.env.FORCE_SQLITE) {
    sequelize = new Sequelize(dbUrl, {
        logging: false,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false },
            connectTimeout: 5000 // Short timeout for faster failover
        },
        retry: { max: 0 } // Don't hang on retries
    });
} else {
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: path.join(__dirname, "../database/database.db"),
        logging: false
    });
}


// Test connection and sync models
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("🗄️ Database connection established successfully via Sequelize.");
    } catch (error) {
        console.warn("⚠️  Primary database connection failed. Falling back to local SQLite...");
        // Re-initialize as SQLite
        Object.assign(sequelize.options, {
            dialect: "sqlite",
            storage: path.join(__dirname, "../database/database.db"),
            logging: false
        });
        // We need to re-create the connection manager for some dialects
        if (sequelize.dialect.name !== 'sqlite') {
            const SQLite = new Sequelize({
                dialect: "sqlite",
                storage: path.join(__dirname, "../database/database.db"),
                logging: false
            });
            // This is a bit hacky but works for sequelize 6+ to force a dialect switch
            sequelize.dialect = SQLite.dialect;
            sequelize.queryInterface = SQLite.queryInterface;
        }
    }
    
    try {
        // sync() creates the tables if they don't exist
        await sequelize.sync({ alter: true }); 
        console.log("✅ Database models synchronized.");
    } catch (syncError) {
        console.error("❌ Database synchronization failed:", syncError.message);
    }
};

module.exports = { sequelize, initDb };