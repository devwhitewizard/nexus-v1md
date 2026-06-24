const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

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

        const isHeroku = !!process.env.DYNO || !!process.env.HEROKU_APP_NAME || !!process.env.HEROKU_API_KEY;

        if (isHeroku) {
            const appName = process.env.HEROKU_APP_NAME;
            const apiKey = process.env.HEROKU_API_KEY;

            if (appName && apiKey) {
                await sock.sendMessage(jid, { text: "🔄 *Heroku Deployment Detected. Triggering programmatic redeploy...*" });
                try {
                    const axios = require("axios");
                    const repoUrl = UPSTREAM_REPO.replace(".git", "");
                    const parts = repoUrl.split("/");
                    const owner = parts[parts.length - 2];
                    const repoName = parts[parts.length - 1];
                    const repoFullName = `${owner}/${repoName}`;
                    const tarballUrl = `https://github.com/${repoFullName}/archive/refs/heads/${UPSTREAM_BRANCH}.tar.gz`;

                    await axios.post(
                        `https://api.heroku.com/apps/${appName}/builds`,
                        {
                            source_blob: {
                                url: tarballUrl,
                                version: "Latest Update"
                            }
                        },
                        {
                            headers: {
                                "Accept": "application/vnd.heroku+json; version=3",
                                "Authorization": `Bearer ${apiKey}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    return await sock.sendMessage(jid, { 
                        text: "🚀 *Heroku build triggered successfully!* The bot is rebuilding and will restart automatically in 2-3 minutes. Monitor your Heroku logs for progress." 
                    });
                } catch (err) {
                    return await sock.sendMessage(jid, { 
                        text: `❌ *Failed to trigger Heroku build:* \`${err.message}\`\n\nEnsure your \`HEROKU_API_KEY\` and \`HEROKU_APP_NAME\` are valid.` 
                    });
                }
            } else {
                // User's case: no owner Heroku access, but linked to their repo
                let herokuMsg = `ℹ️ *Nexus-1MD is running on Heroku.*\n\n`;
                herokuMsg += `Because Heroku uses an ephemeral filesystem, local code changes cannot be saved on the running dyno.\n\n`;
                herokuMsg += `🚀 *How to Update Your Bot:*\n`;
                herokuMsg += `Since this Heroku app deploys from your GitHub repository, you can update it by pushing commits to GitHub:\n\n`;
                herokuMsg += `1. Make sure your local repository is up to date.\n`;
                herokuMsg += `2. Commit and push the latest updates to your repository:\n`;
                herokuMsg += `   \`git add . && git commit -m "Update bot" && git push\`\n`;
                herokuMsg += `3. If *Automatic Deploys* are enabled, Heroku will rebuild the bot automatically.\n`;
                herokuMsg += `4. If not, go to the Heroku Dashboard of the app owner, click the *Deploy* tab, and manually click *Deploy Branch*.`;

                return await sock.sendMessage(jid, { text: herokuMsg });
            }
        }

        // Standard Local / VPS / Panel update routine
        await sock.sendMessage(jid, { text: "🔄 *Checking for updates from main repo...*" });

        const runUpdate = (repo) => {
            // First Fetch
            exec(`git fetch ${repo} ${UPSTREAM_BRANCH}`, async (err, stdout, stderr) => {
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

        // Determine repo dynamically based on current origin if it exists
        exec("git config --get remote.origin.url", (err, originUrl) => {
            const targetRepo = (!err && originUrl && originUrl.trim()) ? originUrl.trim() : UPSTREAM_REPO;

            // Check if git is initialized
            exec("git rev-parse --is-inside-work-tree", (errGit) => {
                if (errGit) {
                    sock.sendMessage(jid, { text: "🛠️ *Initializing Git repository for updates...*" });
                    exec(`git init && git remote add origin ${targetRepo} && git fetch origin`, (errInit) => {
                        if (errInit) {
                            return sock.sendMessage(jid, { text: `❌ *Could not initialize Git.* Please follow manual setup: delete everything EXCEPT \`session/\` and clone again.` });
                        }
                        runUpdate(targetRepo);
                    });
                } else {
                    runUpdate(targetRepo);
                }
            });
        });
    }
};
