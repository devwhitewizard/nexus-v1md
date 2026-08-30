const fs = require("fs");
const path = require("path");

// Load config.env if present locally
if (fs.existsSync(path.join(__dirname, "config.env"))) {
    require("dotenv").config({ path: path.join(__dirname, "config.env") });
}

// 👤 Identity & Security
global.sudo  = process.env.SUDO   || "254101010101";
global.owner = process.env.OWNERS || process.env.SUDO || "254101010101";

// 🤖 Bot Identity
global.botname = process.env.BOT_NAME || "NEXUS-MD";

// 🔑 Session & Connection
global.session       = process.env.SESSION_ID     || "";
global.pairingNumber = process.env.PAIRING_NUMBER || "";

// 🛠️ System Preferences
global.prefix = process.env.PREFIX || ".";
global.mode   = process.env.MODE   || "public";

// 🌐 Database & Storage
global.databaseUrl = process.env.DATABASE_URL || "";

module.exports = {
    sessionName:  global.session,
    botName:      global.botname,
    prefix:       global.prefix,
    ownerNumbers: global.owner.split(",").map(n => n.trim()),
    sudo:         global.sudo,
    mode:         global.mode,
    pairingNumber: global.pairingNumber,
    databaseUrl:  global.databaseUrl,
};
