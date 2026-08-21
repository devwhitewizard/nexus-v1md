const { Sequelize } = require("sequelize");
const path = require("path");

const dbUrl = process.env.DATABASE_URL;

// Global state tracking
let isDatabaseOnline = false;
let sequelize = null;

const dbLog = (sql, duration) => {
    if (duration > 50) {
        console.warn(`🐢 [DB SLOW QUERY] (${duration}ms): ${sql}`);
    }
};

if (dbUrl) {
    // ☁️ Cloud database (PostgreSQL / MySQL on Heroku, Railway, etc.)
    sequelize = new Sequelize(dbUrl, {
        benchmark: true,
        logging: dbLog,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false },
            connectTimeout: 5000
        },
        retry: { max: 0 }
    });
} else {
    // 💾 Local / Panel fallback — check if sqlite3 native binding is compatible with host OS/container
    let canUseSqlite = false;
    try {
        require("sqlite3");
        canUseSqlite = true;
    } catch (e) {
        console.warn("⚠️ SQLite native binary unavailable on this host (GLIBC / container mismatch):", e.message);
        canUseSqlite = false;
    }

    if (canUseSqlite) {
        try {
            const dbPath = path.join(__dirname, "../database/nexus.db");
            sequelize = new Sequelize({
                dialect: "sqlite",
                storage: dbPath,
                benchmark: true,
                logging: dbLog,
                dialectOptions: {
                    mode: null
                },
                pool: {
                    max: 1,
                    min: 0,
                    acquire: 10000,
                    idle: 5000
                }
            });
        } catch (e) {
            console.warn("⚠️ SQLite initialization skipped:", e.message);
            sequelize = null;
        }
    } else {
        sequelize = null;
    }
}

const initDb = async () => {
    if (!sequelize) {
        console.log("ℹ️ Running in Pure-JS JSON storage mode (Zero binary dependencies).");
        isDatabaseOnline = false;
        return;
    }
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
        console.error("❌ Database initialization failed (falling back to JSON store):", error.message);
        isDatabaseOnline = false;
    }
};

module.exports = {
    sequelize,
    initDb,
    isOnline: () => isDatabaseOnline
};