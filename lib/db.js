const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// database file
const db = new sqlite3.Database(
    path.join(__dirname, "../database.db")
);

// initialize tables
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            coins INTEGER DEFAULT 0
        )
    `);

});

module.exports = db;