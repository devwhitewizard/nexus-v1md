const fs = require("fs");
const path = require("path");
const { authFolder } = require("../config");

module.exports = {
    name: "session",
    aliases: ["getsession", "id", "sessionid"],
    description: "Generate a Session ID for deployment.",
    category: "owner",
    ownerOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const credsPath = path.join(__dirname, `../${authFolder}/creds.json`);
            
            if (!fs.existsSync(credsPath)) {
                return await sock.sendMessage(jid, { text: "❌ *Error:* No credentials found. Are you logged in?" });
            }

            const creds = fs.readFileSync(credsPath, "utf-8");
            const sessionId = Buffer.from(creds).toString("base64");
            const finalizedId = `Nexus~${sessionId}`;

            // 1️⃣ Instructions header
            await sock.sendMessage(jid, { 
                text: `📦 *NEXUS-1MD SESSION ID*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                     `Your Session ID is ready! Here's how to use it:\n\n` +
                     `1️⃣ Copy the code in the *next message*\n` +
                     `2️⃣ Go to your hosting dashboard (e.g. Render)\n` +
                     `3️⃣ Add it as an env variable: \`SESSION_ID\`\n\n` +
                     `⚠️ *KEEP THIS PRIVATE!* Anyone with this code controls your WhatsApp.`
            }, { quoted: msg });

            // 2️⃣ Raw ID — easy one-tap copy
            await sock.sendMessage(jid, { text: finalizedId });

            // 3️⃣ creds.json backup file
            await sock.sendMessage(jid, { 
                document: fs.readFileSync(credsPath),
                fileName: "creds.json",
                mimetype: "application/json",
                caption: "📁 *Backup File* — Place this in your `session/` folder if you ever need to restore manually."
            }, { quoted: msg });

        } catch (err) {
            console.error("Session ID Error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to generate Session ID." });
        }
    }
};
