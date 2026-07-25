/**
 * db_cleanup.js
 * Drops orphan SQLite *_backup tables left behind by failed Sequelize alter syncs.
 * Run once: node db_cleanup.js
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'nexus.db');
console.log('Opening database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to open DB:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'", [], (err, rows) => {
    if (err) {
        console.error('Failed to query backup tables:', err.message);
        db.close();
        return;
    }

    console.log(`Found ${rows.length} backup table(s):`, rows.map(r => r.name));

    if (rows.length === 0) {
        console.log('Nothing to clean. Database is healthy.');
        db.close();
        return;
    }

    let remaining = rows.length;
    rows.forEach(row => {
        db.run(`DROP TABLE IF EXISTS [${row.name}]`, [], (dropErr) => {
            if (dropErr) {
                console.error(`Failed to drop ${row.name}:`, dropErr.message);
            } else {
                console.log(`✅ Dropped orphan table: ${row.name}`);
            }
            if (--remaining === 0) {
                console.log('All backup tables cleared. Safe to restart the bot.');
                db.close();
            }
        });
    });
});
