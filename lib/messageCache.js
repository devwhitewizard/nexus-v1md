
const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../database/message_cache.json");
const MAX_ENTRIES = 50; // Much smaller — only what anti-delete actually needs

// In-memory cache — the whole point is to avoid disk I/O on the hot path
let cache = {};
let dirty = false;
let saveTimer = null;

// Load from disk once on startup
function load() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            cache = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
        }
    } catch (e) {
        cache = {};
    }
}

// Debounced async save — never blocks the event loop
function scheduleSave() {
    if (saveTimer) return; // Already queued
    saveTimer = setTimeout(() => {
        saveTimer = null;
        if (!dirty) return;
        dirty = false;
        const data = JSON.stringify(cache);
        const dir = path.dirname(LOG_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFile(LOG_FILE, data, "utf-8", (err) => {
            if (err) console.error("❌ MessageCache save error:", err.message);
        });
    }, 8000); // Write at most once every 8 seconds
}

function setLog(msgId, record) {
    cache[msgId] = record;
    dirty = true;

    // Prune oldest entries when over limit
    const keys = Object.keys(cache);
    if (keys.length > MAX_ENTRIES) {
        // Sort by timestamp to remove the oldest
        const sorted = keys.sort((a, b) => (cache[a]?.timestamp || 0) - (cache[b]?.timestamp || 0));
        const toDelete = sorted.slice(0, keys.length - MAX_ENTRIES);
        for (const k of toDelete) delete cache[k];
    }

    scheduleSave();
}

function getLog(msgId) {
    return cache[msgId] || null;
}

// Initialize on module load
load();

module.exports = { setLog, getLog };
