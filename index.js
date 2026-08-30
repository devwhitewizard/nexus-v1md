const path = require("path");
const fs = require("fs");

// Load user settings from config.env
require("./settings");

console.log("🚀 Initializing Nexus-MD Engine...");

// Launch Core Bot from nexus-md package
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
        console.log("⚠️ Nexus-MD core package not yet installed. Run 'npm install' to fetch dependencies.");
    } else {
        console.error("⚠️ Error launching core engine:", err.message);
    }
}