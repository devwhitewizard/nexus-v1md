const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const UPSTREAM_REPO = "https://github.com/devwhitewizard/nexus-v1md.git";
const UPSTREAM_RAW = "https://raw.githubusercontent.com/devwhitewizard/nexus-v1md/main";
const UPSTREAM_TARBALL = "https://codeload.github.com/devwhitewizard/nexus-v1md/tar.gz/refs/heads/main";
const UPSTREAM_BRANCH = "main";

module.exports = {
    name: "update",
    aliases: ["up", "upgrade"],
    description: "Update the bot to the latest version from GitHub.",
    category: "owner",
    isOwnerOnly: true,
    execute: async ({ sock, jid, msg, args }) => {

        const isHeroku = !!process.env.DYNO || !!process.env.HEROKU_APP_NAME || !!process.env.HEROKU_API_KEY;
        const subCommand = args[0] ? args[0].toLowerCase() : "";

        // If user typed ".update" or ".update check"
        if (!subCommand || subCommand === "check") {
            await sock.sendMessage(jid, { text: "🔍 *Checking for updates on GitHub...*" }, { quoted: msg });
            
            try {
                // 1. Fetch remote package.json version from raw GitHub (No API rate-limit)
                const pkgRes = await axios.get(`${UPSTREAM_RAW}/package.json`, { timeout: 10000 });
                const remoteVersion = pkgRes.data?.version || "Unknown";
                const localPkg = require("../../package.json");
                const localVersion = localPkg.version || "1.0.0";

                // 2. Fetch commit details via GitHub API (with fallback if rate-limited)
                let commitInfo = "";
                try {
                    const commitRes = await axios.get("https://api.github.com/repos/devwhitewizard/nexus-v1md/commits/main", {
                        headers: { "User-Agent": "Nexus-MD-Bot/1.0" },
                        timeout: 5000
                    });
                    const sha = commitRes.data.sha ? commitRes.data.sha.substring(0, 7) : "";
                    const commitMsg = commitRes.data.commit?.message?.split("\n")[0] || "";
                    const author = commitRes.data.commit?.author?.name || "";
                    const date = commitRes.data.commit?.author?.date ? new Date(commitRes.data.commit.author.date).toLocaleString() : "";

                    if (sha) {
                        commitInfo += `\n📌 *Latest Commit Details:*\n`;
                        commitInfo += `• *SHA:* \`${sha}\`\n`;
                        commitInfo += `• *Message:* ${commitMsg}\n`;
                        commitInfo += `• *Author:* ${author}\n`;
                        commitInfo += `• *Date:* ${date}\n`;
                    }
                } catch (_) {
                    // Fail silently if GitHub API rate limits commit endpoint
                }

                let statusMsg = `🔄 *Nexus-MD Update Status*\n`;
                statusMsg += `━━━━━━━━━━━━━━━━━━━\n\n`;
                statusMsg += `📦 *Current Version:* \`v${localVersion}\`\n`;
                statusMsg += `🌐 *Latest Version:* \`v${remoteVersion}\`\n`;
                statusMsg += commitInfo;
                statusMsg += `\n🚀 *To apply updates, reply with:* \`.update now\``;

                return await sock.sendMessage(jid, { text: statusMsg }, { quoted: msg });
            } catch (err) {
                return await sock.sendMessage(jid, { 
                    text: `❌ *Error checking updates:* ${err.message}\n\nYou can force update by typing \`.update now\`` 
                }, { quoted: msg });
            }
        }

        // If subCommand is "now" or "force"
        await sock.sendMessage(jid, { text: "🚀 *Starting update process... Please wait.*" }, { quoted: msg });

        // 1. Heroku API Deployment (If app name and API key are configured)
        if (isHeroku && process.env.HEROKU_APP_NAME && process.env.HEROKU_API_KEY) {
            const appName = process.env.HEROKU_APP_NAME;
            const apiKey = process.env.HEROKU_API_KEY;

            try {
                await axios.post(
                    `https://api.heroku.com/apps/${appName}/builds`,
                    {
                        source_blob: {
                            url: UPSTREAM_TARBALL,
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
                    text: "🚀 *Heroku build triggered successfully!* The bot is rebuilding and will restart automatically in 2-3 minutes." 
                }, { quoted: msg });
            } catch (err) {
                console.error("Heroku build trigger error:", err.message);
                // Fall through to direct update
            }
        }

        // 2. Try Git Reset Mode (If .git exists)
        const rootDir = path.join(__dirname, "../..");
        const hasGit = fs.existsSync(path.join(rootDir, ".git"));

        if (hasGit) {
            return exec(`git fetch origin ${UPSTREAM_BRANCH} && git reset --hard FETCH_HEAD`, async (err, stdout, stderr) => {
                if (!err) {
                    await sock.sendMessage(jid, { text: "✅ *Git update applied successfully!* Restarting bot..." }, { quoted: msg });
                    setTimeout(() => process.exit(1), 2000);
                    return;
                }
                // If git command failed, proceed to direct tarball extractor fallback
                performDirectTarballUpdate();
            });
        }

        // 3. CypherX / Panel / Non-Git Direct Tarball Update Fallback
        async function performDirectTarballUpdate() {
            try {
                const tempTarPath = path.join(rootDir, "temp_update.tar.gz");
                const tempExtractDir = path.join(rootDir, "temp_update_extract");

                // Download Tarball
                const response = await axios.get(UPSTREAM_TARBALL, { responseType: "arraybuffer", timeout: 45000 });
                fs.writeFileSync(tempTarPath, response.data);

                if (!fs.existsSync(tempExtractDir)) fs.mkdirSync(tempExtractDir, { recursive: true });

                // Extract using system tar
                exec(`tar -xzf "${tempTarPath}" -C "${tempExtractDir}"`, async (extractErr) => {
                    if (extractErr) {
                        if (fs.existsSync(tempTarPath)) fs.unlinkSync(tempTarPath);
                        return await sock.sendMessage(jid, { 
                            text: `❌ *Update extraction failed:* ${extractErr.message}\n\nPlease update manually or check server permissions.` 
                        }, { quoted: msg });
                    }

                    try {
                        // Find extracted inner directory (nexus-v1md-main)
                        const files = fs.readdirSync(tempExtractDir);
                        const extractedFolder = files.length > 0 ? path.join(tempExtractDir, files[0]) : tempExtractDir;

                        // Protected paths that MUST NOT be overwritten or deleted
                        const protectedPaths = ["session", ".env", "database/storage.json", "database/nexus.db", "node_modules"];

                        const copyRecursive = (src, dest) => {
                            const entries = fs.readdirSync(src, { withFileTypes: true });
                            for (const entry of entries) {
                                const srcPath = path.join(src, entry.name);
                                const destPath = path.join(dest, entry.name);
                                const relativePath = path.relative(rootDir, destPath).replace(/\\/g, "/");

                                if (protectedPaths.some(p => relativePath === p || relativePath.startsWith(p + "/"))) {
                                    continue; // Skip protected paths
                                }

                                if (entry.isDirectory()) {
                                    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
                                    copyRecursive(srcPath, destPath);
                                } else {
                                    fs.copyFileSync(srcPath, destPath);
                                }
                            }
                        };

                        copyRecursive(extractedFolder, rootDir);

                        // Clean up temporary files safely
                        if (fs.existsSync(tempTarPath)) fs.unlinkSync(tempTarPath);
                        if (fs.existsSync(tempExtractDir)) fs.rmSync(tempExtractDir, { recursive: true, force: true });

                        await sock.sendMessage(jid, { 
                            text: "✅ *Update Successful!* Core bot files updated successfully. Restarting bot in 2 seconds..." 
                        }, { quoted: msg });

                        setTimeout(() => process.exit(1), 2000);
                    } catch (copyErr) {
                        console.error("Copy error:", copyErr);
                        await sock.sendMessage(jid, { text: `❌ *File sync error:* ${copyErr.message}` }, { quoted: msg });
                    }
                });
            } catch (dlErr) {
                console.error("Download error:", dlErr);
                await sock.sendMessage(jid, { text: `❌ *Failed to download update archive:* ${dlErr.message}` }, { quoted: msg });
            }
        }

        performDirectTarballUpdate();
    }
};
