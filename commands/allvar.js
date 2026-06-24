const fs = require("fs");
const path = require("path");

module.exports = {
    name: "allvar",
    description: "View all environment variables at once (masked for security)",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, msg } = ctx;

        // Keys to display
        const keys = new Set(['SUDO', 'OWNERS', 'PREFIX', 'MODE', 'DATABASE_URL', 'SESSION_ID', 'PAIRING_NUMBER', 'GROQ_API_KEY', 'OPENAI_API_KEY']);
        
        // Also load other keys from .env
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const lines = fs.readFileSync(envPath, 'utf8').split('\n');
            for (let line of lines) {
                line = line.trim();
                if (line && !line.startsWith('#') && line.includes('=')) {
                    const key = line.split('=')[0].trim();
                    if (key) keys.add(key);
                }
            }
        }

        const keyList = Array.from(keys).sort();
        let response = `💎 *NEXUS-1MD BOT VARIABLES*\n\n`;
        
        const sensitiveKeys = ['key', 'pass', 'token', 'secret', 'session', 'database', 'url'];
        
        for (const key of keyList) {
            const value = process.env[key];
            let displayValue = "(not set)";
            if (value !== undefined) {
                const lowerKey = key.toLowerCase();
                if (sensitiveKeys.some(s => lowerKey.includes(s))) {
                    if (value.length <= 8) {
                        displayValue = "********";
                    } else {
                        displayValue = value.slice(0, 4) + '...' + value.slice(-4);
                    }
                } else {
                    displayValue = value;
                }
            }
            response += `▸ *${key}:* \`${displayValue}\`\n`;
        }

        response += `\n⚠️ _Sensitive values are masked for security. Use .getvar <key> to view a specific raw value in DM._`;
        
        await sock.sendMessage(jid, { text: response }, { quoted: msg });
    }
};
