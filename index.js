const path = require("path");
const fs = require("fs");
const express = require("express");

// Load user settings
require("./settings");

// Initialize Express web server to bind process.env.PORT for PaaS platforms (CypherX, Heroku, Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("🚀 Nexus-1MD Bot is running!");
});

app.listen(PORT, () => {
    console.log(`🌐 Web server active on port ${PORT}`);
});

console.log("🚀 Initializing Nexus-MD Engine...");

// Launch Core Bot from Nexus-MD dependency
try {
    const nexusEngine = require("nexus-md");
    if (typeof nexusEngine === "function") {
        nexusEngine();
    } else if (nexusEngine && typeof nexusEngine.start === "function") {
        nexusEngine.start();
    } else if (nexusEngine && typeof nexusEngine.connect === "function") {
        nexusEngine.connect();
    } else {
        console.log("✅ Core engine loaded successfully.");
    }
} catch (err) {
    if (err.code === "MODULE_NOT_FOUND" && err.message.includes("nexus-md")) {
        console.log("⚠️ Nexus-MD core package not yet installed locally. Run 'npm install' to fetch dependencies from https://github.com/devwhitewizard/Nexus-MD");
    } else {
        console.error("⚠️ Note launching core engine:", err.message);
    }
}