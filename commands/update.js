const { exec } = require("child_process");
const { isOwner } = require("../lib/middleware");

// 🔗 Always pull from the MAIN developer repo
const UPSTREAM_REPO = "https://github.com/devwhitewizard/nexus-v1md.git";
const UPSTREAM_BRANCH = "main";

module.exports = {
    name: "update",
    aliases: ["up", "upgrade"],
    description: "Update the bot to the latest version from the developer's GitHub.",
    category: "owner",
    sudoOnly: true, // 🔒 Strict security
    execute: async ({ sock, jid, msg, args }) => {
        const { isSudo } = require("../lib/middleware");
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!isSudo(sender)) return; // Double-check protection

        await sock.sendMessage(jid, { text: "🔄 *Checking for updates from main repo...*" });

        const runUpdate = () => {
            // First Fetch
            exec(`git fetch ${UPSTREAM_REPO} ${UPSTREAM_BRANCH}`, async (err, stdout, stderr) => {
                if (err) {
                    return await sock.sendMessage(jid, { 
                        text: `❌ *Error fetching updates:*\n${err.message}` 
                    });
                }

                // Check difference
                exec(`git log HEAD..FETCH_HEAD --oneline`, async (err2, stdout2) => {
                    if (err2 || !stdout2.trim()) {
                        return await sock.sendMessage(jid, { text: "✅ *Bot is already up-to-date!*" });
                    }

                    const commits = stdout2.trim().split("\n");
                    let updateMsg = `🆕 *${commits.length} New Update(s) Available!*\n\n`;
                    updateMsg += commits.map(c => `• ${c}`).join("\n");
                    updateMsg += `\n\n*Type .update now* to apply.`;

                    if (args[0] === "now") {
                        await sock.sendMessage(jid, { text: "🚀 *Applying Force-Sync update...*" });
                        
                        // Use RESET --HARD to ensure the local folder matches upstream 100%
                        // This overwrites any local ZIP mess or fork conflicts.
                        exec(`git reset --hard FETCH_HEAD`, async (err3, out3) => {
                            if (err3) {
                                return await sock.sendMessage(jid, { 
                                    text: `❌ *Forced Sync Failed:*\n${err3.message}` 
                                });
                            }
                            
                            // Optional: clean untracked files to be totally fresh
                            exec(`git clean -fd`, () => {
                                sock.sendMessage(jid, { text: "✅ *Sync Successful!* Core files updated. Restarting..." });
                                setTimeout(() => process.exit(1), 2000);
                            });
                        });
                    } else {
                        await sock.sendMessage(jid, { text: updateMsg });
                    }
                });
            });
        };

        // Check if git is initialized
        exec("git rev-parse --is-inside-work-tree", (err) => {
            if (err) {
                sock.sendMessage(jid, { text: "🛠️ *Initializing Git repository for updates...*" });
                exec(`git init && git remote add origin ${UPSTREAM_REPO} && git fetch origin`, (err2) => {
                    if (err2) {
                        return sock.sendMessage(jid, { text: "❌ *Could not initialize Git.* Please follow manual setup: delete everything EXCEPT `session/` and use the Panel's Git feature." });
                    }
                    runUpdate();
                });
            } else {
                runUpdate();
            }
        });
    }
};
