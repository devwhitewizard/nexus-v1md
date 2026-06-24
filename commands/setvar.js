const fs = require("fs");
const path = require("path");

module.exports = {
    name: "setvar",
    description: "Set or change a bot environment variable",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const input = args.join(" ");
        const match = input.match(/^([^=]+)=(.*)$/);

        if (!match) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.setvar KEY=VALUE`" }, { quoted: msg });
        }

        const key = match[1].trim().toUpperCase();
        const value = match[2].trim();

        // 1. Update runtime environment
        process.env[key] = value;

        // Special sync actions
        if (key === "PREFIX") {
            try {
                const config = require("../config");
                config.prefixes = [value];
            } catch (e) {
                console.error("Failed to sync config prefixes:", e);
            }
        }

        // 2. Persist to .env file if it exists
        let persisted = false;
        try {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                let content = fs.readFileSync(envPath, 'utf8');
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (regex.test(content)) {
                    content = content.replace(regex, `${key}=${value}`);
                } else {
                    content = content.trim() + `\n${key}=${value}\n`;
                }
                fs.writeFileSync(envPath, content);
                persisted = true;
            }
        } catch (e) {
            console.error("Failed to write to .env file:", e);
        }

        let response = `✅ *Variable Set!*\n\n`;
        response += `▸ *Key:* \`${key}\`\n`;
        response += `▸ *Value:* \`${value}\`\n\n`;
        response += `🔄 *Runtime update:* Active immediately.\n`;
        if (persisted) {
            response += `💾 *Persistence:* Written to \`.env\` for next restart.\n`;
        } else {
            response += `⚠️ *Persistence:* Running without \`.env\`. Value will reset on next container reboot.`;
        }

        await sock.sendMessage(jid, { text: response }, { quoted: msg });
    }
};
