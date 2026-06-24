
const fs = require("fs");
const path = require("path");

const STORAGE_FILE = path.join(__dirname, "../database/storage.json");

/**
 * Super simple Pure-JS JSON storage for when real databases are missing.
 * Zero binary dependencies (No SQLite/GLIBC headaches!)
 */
class JsonStore {
    constructor() {
        this.cache = {};
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(STORAGE_FILE)) {
                this.cache = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
            } else {
                this.cache = {};
                this.save();
            }
        } catch (e) {
            console.error("❌ JsonStore Load Error:", e.message);
            this.cache = {};
        }
    }

    save() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        
        this.saveTimeout = setTimeout(() => {
            try {
                const dir = path.dirname(STORAGE_FILE);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                
                const data = JSON.stringify(this.cache); // Fast serialization without spaces/replacer to save CPU
                fs.writeFile(STORAGE_FILE, data, "utf-8", (err) => {
                    if (err) {
                        console.error("❌ JsonStore Save Error:", err.message);
                    }
                });
                this.saveTimeout = null;
            } catch (e) {
                console.error("❌ JsonStore Save Error:", e.message);
                this.saveTimeout = null;
            }
        }, 5000); // Debounce for 5 seconds to batch multiple writes together
    }

    getAll() {
        return this.cache;
    }

    get(key, defaultValue = null) {
        return this.cache[key] !== undefined ? this.cache[key] : defaultValue;
    }

    set(key, value) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            const cleanObj = {};
            for (const k in value) {
                if (k !== "dataValues" && k !== "update" && k !== "save" && typeof value[k] !== "function") {
                    cleanObj[k] = value[k];
                }
            }
            this.cache[key] = cleanObj;
        } else {
            this.cache[key] = value;
        }
        this.save();
    }

    // Sequelize-like polyfills for settings
    async findOrCreate(options) {
        const key = `settings_${options.where.id}`;
        if (!this.cache[key]) {
            this.cache[key] = options.defaults;
            this.save();
        }
        const data = this.cache[key];
        // Return a mock object with update/save methods
        return [{
            ...data,
            dataValues: data,
            update: async (updates) => {
                const cleanUpdates = {};
                for (const k in updates) {
                    if (k !== "dataValues" && k !== "update" && k !== "save" && typeof updates[k] !== "function") {
                        cleanUpdates[k] = updates[k];
                    }
                }
                Object.assign(this.cache[key], cleanUpdates);
                this.save();
                return this.cache[key];
            },
            save: async () => {
                this.save();
                return this.cache[key];
            }
        }];
    }
}

module.exports = new JsonStore();
