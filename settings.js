const fs = require("fs");
const path = require("path");

// Load .env if present locally
if (fs.existsSync(path.join(__dirname, ".env"))) {
    require("dotenv").config({ path: path.join(__dirname, ".env") });
}

global.owner = process.env.OWNER_NUMBER || process.env.SUDO || "254797715445";
global.botname = process.env.BOT_NAME || "NEXUS-1MD";
global.prefix = process.env.PREFIX || ".";
global.session = process.env.SESSION_ID || "";
global.mode = process.env.MODE || "public";
global.sudo = process.env.SUDO || "254797715445";

module.exports = {
    sessionName: global.session,
    botName: global.botname,
    prefix: global.prefix,
    ownerNumbers: [global.owner],
    sudo: global.sudo,
    mode: global.mode
};
