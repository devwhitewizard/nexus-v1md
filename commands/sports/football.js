const axios = require("axios");

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

module.exports = {
    name: "football",
    aliases: ["soccer"],
    description: "Get live football scores and upcoming match details.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/livescore`, { timeout: 10000 });
            let text = `⚽ *LIVE FOOTBALL MATCHES & SCORES* ⚽\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && res.data?.result?.games) {
                const games = Object.values(res.data.result.games).slice(0, 10);
                if (games.length > 0) {
                    games.forEach((g, index) => {
                        const status = g.R?.st || "Scheduled";
                        const score1 = g.R?.r1 ?? "-";
                        const score2 = g.R?.r2 ?? "-";
                        const time = g.tm ? ` (${g.tm})` : "";
                        text += `${index + 1}. *${g.p1}* ${score1} - ${score2} *${g.p2}*\n`;
                        text += `   ⏱️ Status: ${status}${time}\n\n`;
                    });
                } else {
                    text += `No live matches currently in progress.\n\n`;
                }
            } else {
                text += `Unable to fetch live score data right now.\n\n`;
            }

            text += `💡 _Use \`.fixtures\` for upcoming matches or \`.standings\` for league tables!_`;
            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("Football command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch live football info from API." }, { quoted: msg });
        }
    }
};
