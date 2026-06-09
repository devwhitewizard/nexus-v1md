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
    // Session cleanup is bypassed to maintain WhatsApp end-to-end encryption keys.
    // Deleting session-*, pre-key-*, or sender-key-* files causes decryption errors (e.g. "Bad MAC") and halts command handling.
    return 0;
}

module.exports = { cleanSessionFolder };
