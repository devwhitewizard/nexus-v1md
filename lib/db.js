const { Sequelize } = require("sequelize");
const path = require("path");

const dbUrl = process.env.DATABASE_URL;

// Global state tracking
let isDatabaseOnline = false;
let sequelize = null;

if (dbUrl) {
    // ☁️ Cloud database (PostgreSQL / MySQL on Heroku, Railway, etc.)
    sequelize = new Sequelize(dbUrl, {
        logging: false,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false },
            connectTimeout: 5000
        },
        retry: { max: 0 }
    });
} else {
    // 💾 Local / Panel fallback — use SQLite (much faster than JSON file store!)
    // sqlite3 is already installed. SQLite uses indexed B-tree lookups and WAL
    // mode so reads/writes are non-blocking and don't load the entire file.
    const dbPath = path.join(__dirname, "../database/nexus.db");
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: dbPath,
        logging: false,
        // WAL (Write-Ahead Log) mode: reads never block writes, writes never block reads
        dialectOptions: {
            mode: null
        },
        pool: {
            max: 1,        // SQLite only supports 1 writer at a time
            min: 0,
            acquire: 10000,
            idle: 5000
        }
    });
}

const initDb = async () => {
    try {
        await sequelize.authenticate();

        // Enable WAL mode for SQLite (skipped silently for Postgres/MySQL)
        if (!dbUrl) {
            await sequelize.query("PRAGMA journal_mode=WAL;").catch(() => {});
            await sequelize.query("PRAGMA synchronous=NORMAL;").catch(() => {});
            await sequelize.query("PRAGMA cache_size=-16000;").catch(() => {}); // 16MB page cache
            console.log("🗄️ SQLite database ready (WAL mode enabled).");
        } else {
            console.log("🗄️ Cloud database connected successfully.");
        }

        await sequelize.sync({ alter: true });
        console.log("✅ Database models synchronized.");
        isDatabaseOnline = true;
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        isDatabaseOnline = false;
    }
};

module.exports = {
    sequelize,
    initDb,
    isOnline: () => isDatabaseOnline
};