const fs = require("fs");
const path = require("path");
const { authFolder } = require("../config");

/**
 * Automatically prunes expired/stale temporary session files.
 * @param {number} maxAgeHours - Maximum age of files in hours to keep (default: 24)
 * @param {boolean} forceAll - If true, ignores age and deletes all temporary session files (preserving only creds.json and device-list files)
 * @returns {number} - The count of deleted files
 */
function cleanSessionFolder(maxAgeHours = 24, forceAll = false) {
    try {
        const sessionDir = path.join(__dirname, "..", authFolder);
        if (!fs.existsSync(sessionDir)) return 0;
        
        const files = fs.readdirSync(sessionDir);
        let deletedCount = 0;
        const now = Date.now();
        const MAX_AGE_MS = maxAgeHours * 60 * 60 * 1000;
        
        for (const file of files) {
            // Absolutely preserve credentials and state sync / device list files
            if (file === "creds.json" || file.startsWith("app-state") || file.startsWith("device-list-")) {
                continue;
            }
            
            const filePath = path.join(sessionDir, file);
            try {
                if (forceAll) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } else {
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtimeMs > MAX_AGE_MS) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                }
            } catch (e) {
                // Ignore files that are deleted mid-process or inaccessible
            }
        }
        if (deletedCount > 0) {
            console.log(`🧹 [Session Cleanup] Automatically cleared ${deletedCount} ${forceAll ? "temporary" : "stale"} session files.`);
        }
        return deletedCount;
    } catch (err) {
        console.error("⚠️ [Session Cleanup] Error running session cleanup:", err.message);
        return 0;
    }
}

module.exports = { cleanSessionFolder };
