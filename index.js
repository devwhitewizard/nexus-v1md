const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// Load user settings from config.env
require("./settings");

// Internal engine source (obfuscate this file before publishing)
const ENGINE_SRC = "github:devwhitewizard/Nexus-MD";

function ensureEngine() {
    try {
        require.resolve("nexus-md");
        return true;
    } catch (e) {
        console.log("📦 Installing core engine...");
        try {
            execSync(`npm install ${ENGINE_SRC}`, { stdio: "inherit" });
            console.log("✅ Core engine installed.");
            return true;
        } catch (err) {
            console.error("❌ Failed to install core engine:", err.message);
            return false;
        }
    }
}

console.log("🚀 Initializing Nexus-MD Engine...");

if (ensureEngine()) {
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
        console.error("⚠️ Error launching core engine:", err.message);
    }
}