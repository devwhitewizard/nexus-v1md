const axios = require("axios");

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

module.exports = {
    name: "nba",
    aliases: ["basketball"],
    description: "Search NBA/Basketball teams, players, and events.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim() || "Lakers";
        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/teamsearch?q=${encodeURIComponent(query)}`, { timeout: 10000 });

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const team = res.data.result[0];
                let text = `🏀 *NBA / BASKETBALL INFO* 🏀\n`;
                text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                text += `*Team:* ${team.name || query}\n`;
                if (team.league) text += `*League:* ${team.league}\n`;
                if (team.formedYear) text += `*Formed:* ${team.formedYear}\n`;
                if (team.stadium) text += `*Arena:* ${team.stadium} (Capacity: ${team.stadiumCapacity || "N/A"})\n`;
                if (team.location) text += `*Location:* ${team.location}, ${team.country || ""}\n`;
                if (team.description) text += `\n📝 *About:* ${team.description.slice(0, 300)}...\n`;

                const imageUrl = team.badges?.small || team.badges?.large;
                if (imageUrl) {
                    await sock.sendMessage(jid, { image: { url: imageUrl }, caption: text }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(jid, { text: `🏀 *NBA Info:* Search results for *"${query}"* returned no active data.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("NBA command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch NBA info from Keith API." }, { quoted: msg });
        }
    }
};
