const axios = require("axios");

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

module.exports = {
    name: "cricket",
    description: "Search cricket teams, players, and match events.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim() || "India";
        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/teamsearch?q=${encodeURIComponent(query)}`, { timeout: 10000 });
            
            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const team = res.data.result[0];
                let text = `🏏 *CRICKET TEAM INFO* 🏏\n`;
                text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                text += `*Team:* ${team.name || query}\n`;
                if (team.alternateName) text += `*Alternate Name:* ${team.alternateName}\n`;
                if (team.formedYear) text += `*Formed Year:* ${team.formedYear}\n`;
                if (team.country) text += `*Country:* ${team.country}\n`;
                if (team.stadium) text += `*Home Venue:* ${team.stadium}\n`;
                if (team.description) text += `\n📝 *About:* ${team.description.slice(0, 300)}...\n`;

                const imageUrl = team.badges?.small || team.badges?.large;
                if (imageUrl) {
                    await sock.sendMessage(jid, { image: { url: imageUrl }, caption: text }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(jid, { text: `🏏 *Cricket Info:* Search results for *"${query}"* returned no active data.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("Cricket command error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch cricket information from Keith API." }, { quoted: msg });
        }
    }
};
