const { exec } = require("child_process");
const { isOwner } = require("../lib/middleware");

// 🔗 Always pull from the MAIN developer repo, regardless of user's fork
const UPSTREAM_REPO = "https://github.com/devwhitewizard/nexus-v1md.git";
const UPSTREAM_BRANCH = "main";

module.exports = {
    name: "update",
    aliases: ["up", "upgrade"],
    description: "Update the bot to the latest version from the developer's GitHub.",
    category: "owner",
    execute: async ({ sock, jid, msg, args }) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!isOwner(sender)) return;

        await sock.sendMessage(jid, { text: "🔄 *Checking for updates from main repo...*" });

        exec(`git fetch ${UPSTREAM_REPO} ${UPSTREAM_BRANCH}`, async (err, stdout, stderr) => {
            if (err) {
                return await sock.sendMessage(jid, { 
                    text: `❌ *Error checking for updates:*\n${err.message}` 
                });
            }

            exec(`git log HEAD..FETCH_HEAD --oneline`, async (err2, stdout2) => {
                if (err2 || !stdout2.trim()) {
                    return await sock.sendMessage(jid, { text: "✅ *Bot is already up-to-date!*" });
                }

                const commits = stdout2.trim().split("\n");
                let updateMsg = `🆕 *${commits.length} New Update(s) Available!*\n\n`;
                updateMsg += commits.map(c => `• ${c}`).join("\n");
                updateMsg += `\n\n*Type .update now* to apply.`;

                if (args[0] === "now") {
                    await sock.sendMessage(jid, { text: "🚀 *Applying update from main repo...*" });
                    exec(`git pull ${UPSTREAM_REPO} ${UPSTREAM_BRANCH}`, async (err3, out3) => {
                        if (err3) {
                            return await sock.sendMessage(jid, { 
                                text: `❌ *Update Failed:*\n${err3.message}` 
                            });
                        }
                        await sock.sendMessage(jid, { text: "✅ *Updated successfully!* Restarting..." });
                        process.exit(1); // Panel/PM2 will auto-restart
                    });
                } else {
                    await sock.sendMessage(jid, { text: updateMsg });
                }
            });
        });
    }
};
