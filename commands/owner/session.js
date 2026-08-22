const fs = require("fs");
const path = require("path");
const { authFolder } = require("../../config");

module.exports = {
    name: "session",
    aliases: ["getsession", "id", "sessionid"],
    description: "Generate a Session ID for deployment.",
    category: "owner",
    ownerOnly: true,
    async execute({ sock, jid, msg, sender }) {
        try {
            const credsPath = path.join(process.cwd(), authFolder, "creds.json");

            if (!fs.existsSync(credsPath)) {
                return await sock.sendMessage(jid, { text: "❌ *Error:* No credentials found. Are you logged in?" });
            }

            const creds = fs.readFileSync(credsPath, "utf-8");
            const sessionId = Buffer.from(creds).toString("base64");
            const finalizedId = `Nexus~${sessionId}`;

            // Determine if command was run inside a group
            const isGroup = jid.endsWith("@g.us");

            // Private DM jid of the sender (strip device suffix e.g. :40)
            const senderJid = (sender || "").replace(/:\d+@/, "@") || jid;
            const privateJid = isGroup ? senderJid : jid;

            // If in a group, notify the group without leaking anything sensitive
            if (isGroup) {
                await sock.sendMessage(jid, {
                    text: `🔒 *Session ID is private!*\n\nI've sent your Session ID to your *private chat* to keep it safe. Check your DMs! 📩`
                }, { quoted: msg });
            }

            // 1️⃣ Instructions header — sent to PRIVATE chat only
            await sock.sendMessage(privateJid, {
                text: `📦 *NEXUS-1MD SESSION ID*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Your Session ID is ready! Here's how to use it:\n\n` +
                    `1️⃣ Copy the code in the *last message*\n` +
                    `2️⃣ Go to your hosting dashboard (e.g. Render)\n` +
                    `3️⃣ Add it as an env variable: \`SESSION_ID\`\n\n` +
                    `⚠️ *KEEP THIS PRIVATE!* Anyone with this code controls your WhatsApp.`
            });

            // 2️⃣ creds.json backup file — sent to PRIVATE chat only
            await sock.sendMessage(privateJid, {
                document: fs.readFileSync(credsPath),
                fileName: "creds.json",
                mimetype: "application/json",
                caption: "📁 *Backup File* — Place this in your `session/` folder if you ever need to restore manually."
            });

            // 3️⃣ Raw ID — easy one-tap copy — sent to PRIVATE chat only
            await sock.sendMessage(privateJid, { text: finalizedId });

        } catch (err) {
            console.error("Session ID Error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to generate Session ID." });
        }
    }
};
