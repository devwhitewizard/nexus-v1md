module.exports = {
    // Bot version
    version: "1.0.0",

    // Bot owners (Full JIDs or raw numbers)
    ownerNumbers: [
        ...(process.env.SUDO ? [process.env.SUDO.includes("@") ? process.env.SUDO.trim() : `${process.env.SUDO.trim()}@s.whatsapp.net`] : []),
        ...(process.env.OWNERS ? process.env.OWNERS.split(",").map(num => num.trim().includes("@") ? num.trim() : `${num.trim()}@s.whatsapp.net`) : []),
        "254797715445@s.whatsapp.net", // Default Fallback
    ],

    // Command prefixes the bot will respond to
    prefixes: ["!", ".", "/"],

    // Baileys auth folder
    authFolder: "session",

    // Max IDs to track for duplicate prevention
    processedIdLimit: 500,

    // Admins (in addition to owner) — add numbers like "2547...@s.whatsapp.net"
    admins: [],

    // AI Configuration (Read from .env for security)
    openaiKey: process.env.OPENAI_API_KEY || "", 
    groqKey: process.env.GROQ_API_KEY || "", 
};
