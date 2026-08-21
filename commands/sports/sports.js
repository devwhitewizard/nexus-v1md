const axios = require("axios");
const { getSettings } = require("../../lib/settings");

const KEITH_API_BASE = "https://apiskeith2-production-3020.up.railway.app";

// Main export: livesports command
const livesportsCommand = {
    name: "livesports",
    aliases: ["livesport"],
    description: "Get active live sports broadcasts and live match scores from API.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/livescore`, { timeout: 10000 });
            let text = `⚽ *NEXUS LIVE SPORTS HUB* ⚽\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && res.data?.result?.games) {
                const games = Object.values(res.data.result.games).slice(0, 8);
                text += `🏟️ *Active Broadcasts & Matches:* \n\n`;
                games.forEach((g, index) => {
                    const status = g.R?.st || "Scheduled";
                    const score1 = g.R?.r1 ?? "-";
                    const score2 = g.R?.r2 ?? "-";
                    text += `${index + 1}. *${g.p1}* ${score1} - ${score2} *${g.p2}* [${status}]\n`;
                });
            } else {
                text += `No active live broadcasts reported right now.\n\n`;
            }

            text += `\n💡 _Type \`.livescore\` to view current scores or \`.fixtures\` for upcoming matches!_`;
            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("livesports error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch live sports data from API." }, { quoted: msg });
        }
    }
};

livesportsCommand.sportscats = {
    name: "sportscats",
    aliases: ["sportcategories"],
    description: "List sports categories and commands supported by the bot.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `⚽ *NEXUS SPORTS COMMANDS & CATEGORIES* ⚽\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `Explore real-time data powered by Sports API:\n\n`;
        text += `• 🏃‍♂️ *.player <name>* — Search player bio, team, nationality & status\n`;
        text += `• 🛡️ *.team <name>* — Search team details, stadium & league\n`;
        text += `• 🏟️ *.stadium <name>* — Search stadium / venue details\n`;
        text += `• 📊 *.standings <league>* — League tables (epl, ucl, laliga, bundesliga, seriea, ligue1, euros, fifa)\n`;
        text += `• 📅 *.fixtures <league>* — Upcoming match fixtures\n`;
        text += `• ⚽ *.livescore* — Live football match scores\n`;
        text += `• 🥇 *.topscorers <league>* — Top goal scorers\n`;
        text += `• 🔮 *.predictions* — Sure betting tips & free odds\n`;
        text += `• 📰 *.fnews* — Latest football news\n`;
        text += `• 📜 *.gamehistory <match>* — Match events & history\n`;
        text += `• ⚽ *.football* / 🏀 *.nba* / 🏏 *.cricket*\n\n`;
        text += `💡 _Example: \`.standings ucl\` or \`.player Bukayo Saka\`_`;
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.flive = {
    name: "flive",
    aliases: ["footballlive"],
    description: "View active live football match scores.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/livescore`, { timeout: 10000 });
            let text = `⚽ *LIVE FOOTBALL MATCHES* ⚽\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && res.data?.result?.games) {
                const games = Object.values(res.data.result.games).slice(0, 10);
                games.forEach((g, i) => {
                    const st = g.R?.st || "Live";
                    const r1 = g.R?.r1 ?? "0";
                    const r2 = g.R?.r2 ?? "0";
                    text += `${i + 1}. *${g.p1}* ${r1} - ${r2} *${g.p2}* (${st})\n`;
                });
            } else {
                text += `No live football matches currently active.\n`;
            }

            text += `\n🎙️ _Type \`.flive2\` for detailed match events!_`;
            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("flive error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch live scores." }, { quoted: msg });
        }
    }
};

livesportsCommand.flive2 = {
    name: "flive2",
    aliases: ["footballcommentary"],
    description: "View detailed live commentary and events for active matches.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/livescore2`, { timeout: 10000 });
            let text = `🎙️ *LIVE FOOTBALL MATCH DETAILS & EVENTS* 🎙️\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            const list = res.data?.result?.data?.list;
            if (res.data?.status && Array.isArray(list) && list.length > 0) {
                list.slice(0, 5).forEach((item, idx) => {
                    const t1 = item.team1?.name || "Home";
                    const s1 = item.team1?.score || "0";
                    const t2 = item.team2?.name || "Away";
                    const s2 = item.team2?.score || "0";
                    text += `${idx + 1}. *${t1}* ${s1} - ${s2} *${t2}*\n`;
                });
            } else {
                text += `No detailed commentary events available at this moment.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("flive2 error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch detailed match events." }, { quoted: msg });
        }
    }
};

livesportsCommand.predictions = {
    name: "predictions",
    aliases: ["pred", "bet"],
    description: "View sure betting tips, odds, and match predictions.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/bet`, { timeout: 10000 });
            let text = `🔮 *SURE BET TIPS & MATCH ODDS* 🔮\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                let count = 0;
                for (const item of res.data.result) {
                    if (count >= 6) break;
                    const leagueName = item.league || "Matches";
                    if (Array.isArray(item.matches) && item.matches.length > 0) {
                        text += `🏆 *${leagueName}*\n`;
                        item.matches.forEach((m) => {
                            count++;
                            const home = m.homeTeam || "Home";
                            const away = m.awayTeam || "Away";
                            const tip = m.prediction?.tip || "Over 1.5";
                            const odd = m.prediction?.odd || "1.50";
                            text += `• *${home}* vs *${away}*\n`;
                            text += `  💡 *Tip:* ${tip} | *Odd:* ${odd}\n\n`;
                        });
                    }
                }
            } else {
                text += `No betting tips available right now.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("predictions error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch predictions." }, { quoted: msg });
        }
    }
};

livesportsCommand.fstream = {
    name: "fstream",
    aliases: ["footballstreams"],
    description: "Get active live score streams.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/livescore`, { timeout: 10000 });
            let text = `📺 *NEXUS LIVE FOOTBALL STREAMS* 📺\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && res.data?.result?.games) {
                const games = Object.values(res.data.result.games).slice(0, 5);
                games.forEach((g, i) => {
                    text += `🔗 *Match ${i + 1}:* ${g.p1} vs ${g.p2} (${g.R?.st || "FT"})\n`;
                });
            } else {
                text += `No active streams available at this time.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("fstream error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch stream details." }, { quoted: msg });
        }
    }
};

livesportsCommand.fnews = {
    name: "fnews",
    aliases: ["footballnews"],
    description: "Get latest football news headlines.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/football/news`, { timeout: 10000 });
            let text = `📰 *LATEST FOOTBALL NEWS HEADLINES* 📰\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            const items = res.data?.result?.data?.items;
            if (res.data?.status && Array.isArray(items) && items.length > 0) {
                items.slice(0, 5).forEach((item, idx) => {
                    const title = item.title || "Headline";
                    const summary = item.summary ? item.summary.replace(/<[^>]*>/g, "").slice(0, 150) : "";
                    text += `${idx + 1}. 🚨 *${title}*\n`;
                    if (summary) text += `   ${summary}...\n\n`;
                });
            } else {
                text += `No news items available right now.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("fnews error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch football news." }, { quoted: msg });
        }
    }
};

livesportsCommand.blive = {
    name: "blive",
    aliases: ["basketballlive", "nbalive"],
    description: "View basketball / NBA team and event info.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/teamsearch?q=Lakers`, { timeout: 10000 });
            let text = `🏀 *BASKETBALL / NBA LIVE INFO* 🏀\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const team = res.data.result[0];
                text += `🏆 *Featured Team:* ${team.name}\n`;
                text += `• *League:* ${team.league || "NBA"}\n`;
                text += `• *Arena:* ${team.stadium || "N/A"} (${team.location || ""})\n`;
            } else {
                text += `No live basketball games currently reported.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("blive error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch basketball scores." }, { quoted: msg });
        }
    }
};

livesportsCommand.livescore = {
    name: "livescore",
    aliases: ["score", "scores"],
    description: "View unified live scores across sports.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/livescore`, { timeout: 10000 });
            let text = `🏆 *NEXUS LIVE SCOREBOARD* 🏆\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && res.data?.result?.games) {
                const games = Object.values(res.data.result.games).slice(0, 10);
                games.forEach((g, i) => {
                    const st = g.R?.st || "Live";
                    const r1 = g.R?.r1 ?? "0";
                    const r2 = g.R?.r2 ?? "0";
                    text += `${i + 1}. *${g.p1}* ${r1} - ${r2} *${g.p2}* (${st})\n`;
                });
            } else {
                text += `No live scores active at the moment.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("livescore error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch live scores." }, { quoted: msg });
        }
    }
};

livesportsCommand.sportnews = {
    name: "sportnews",
    aliases: ["sportsnews"],
    description: "Get general sports headlines.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        try {
            const res = await axios.get(`${KEITH_API_BASE}/football/news`, { timeout: 10000 });
            let text = `📰 *NEXUS SPORTS HEADLINES* 📰\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            const items = res.data?.result?.data?.items;
            if (res.data?.status && Array.isArray(items) && items.length > 0) {
                items.slice(0, 5).forEach((item, idx) => {
                    const title = item.title || "Headline";
                    text += `${idx + 1}. 🚨 *${title}*\n`;
                });
            } else {
                text += `No current sports headlines found.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("sportnews error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch sports headlines." }, { quoted: msg });
        }
    }
};

livesportsCommand.topscorers = {
    name: "topscorers",
    aliases: ["goals"],
    description: "View top goal scorers across European football leagues and UCL.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const inputLeague = (args[0] || "epl").toLowerCase();
        const validLeagues = ["epl", "ucl", "laliga", "bundesliga", "seriea", "ligue1", "euros", "fifa"];
        const league = validLeagues.includes(inputLeague) ? inputLeague : "epl";

        try {
            const res = await axios.get(`${KEITH_API_BASE}/${league}/scorers`, { timeout: 10000 });
            let text = `⚽ *TOP GOAL SCORERS (${league.toUpperCase()})* ⚽\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            const rawData = res.data?.result;
            const scorers = Array.isArray(rawData) ? rawData : (rawData?.topScorers || rawData?.scorers);

            if (res.data?.status && Array.isArray(scorers) && scorers.length > 0) {
                scorers.slice(0, 10).forEach((s, idx) => {
                    const name = s.player || s.name || "Player";
                    const team = s.team || "Team";
                    const goals = s.goals || 0;
                    text += `${idx + 1}. *${name}* (${team}) - ${goals} Goals\n`;
                });
            } else if (res.data?.error) {
                text += `⚠️ *API Status:* ${res.data.error}\n\n_Try specifying another league e.g. \`.topscorers ucl\` or \`.topscorers laliga\`._\n`;
            } else {
                text += `No top scorers data returned for ${league.toUpperCase()}.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("topscorers error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Failed to fetch top scorers for ${league.toUpperCase()}.` }, { quoted: msg });
        }
    }
};

livesportsCommand.standings = {
    name: "standings",
    aliases: ["table"],
    description: "View current football league standings.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const inputLeague = (args[0] || "epl").toLowerCase();
        const leagueMap = {
            epl: "epl",
            premier: "epl",
            ucl: "ucl",
            championsleague: "ucl",
            laliga: "laliga",
            spain: "laliga",
            bundesliga: "bundesliga",
            germany: "bundesliga",
            seriea: "seriea",
            italy: "seriea",
            ligue1: "ligue1",
            france: "ligue1",
            euros: "euros",
            fifa: "fifa"
        };
        const endpoint = leagueMap[inputLeague] || "epl";

        try {
            const res = await axios.get(`${KEITH_API_BASE}/${endpoint}/standings`, { timeout: 10000 });
            const comp = res.data?.result?.competition || endpoint.toUpperCase();
            const standings = res.data?.result?.standings;

            let text = `🏆 *LEAGUE STANDINGS TABLE (${comp})* 🏆\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && Array.isArray(standings) && standings.length > 0) {
                text += `\`Pos  Team                   P   W  D  L  Pts\`\n`;
                text += `─────────────────────────────────────────\n`;
                standings.slice(0, 15).forEach((t) => {
                    const pos = String(t.position).padStart(2, " ");
                    const teamName = t.team.length > 18 ? t.team.slice(0, 18) + "." : t.team.padEnd(19, " ");
                    const p = String(t.played).padStart(2, " ");
                    const w = String(t.won).padStart(2, " ");
                    const d = String(t.draw).padStart(2, " ");
                    const l = String(t.lost).padStart(2, " ");
                    const pts = String(t.points).padStart(3, " ");
                    text += `${pos}. ${teamName} ${p} ${w} ${d} ${l} ${pts}\n`;
                });
                text += `\n💡 _Leagues supported: epl, ucl, laliga, bundesliga, seriea, ligue1, euros, fifa_`;
            } else {
                text += `No standings table data found for ${endpoint.toUpperCase()}.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("standings error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Failed to fetch standings for ${endpoint}.` }, { quoted: msg });
        }
    }
};

livesportsCommand.fixtures = {
    name: "fixtures",
    aliases: ["fixture", "matches"],
    description: "View upcoming match fixtures.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const inputLeague = (args[0] || "epl").toLowerCase();
        const validLeagues = ["epl", "ucl", "laliga", "bundesliga", "seriea", "ligue1", "euros", "fifa"];
        const endpoint = validLeagues.includes(inputLeague) ? inputLeague : "epl";

        try {
            const res = await axios.get(`${KEITH_API_BASE}/${endpoint}/upcomingmatches`, { timeout: 10000 });
            const comp = res.data?.result?.competition || endpoint.toUpperCase();
            const matches = res.data?.result?.upcomingMatches;

            let text = `📅 *UPCOMING MATCH FIXTURES (${comp})* 📅\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (res.data?.status && Array.isArray(matches) && matches.length > 0) {
                matches.slice(0, 10).forEach((m, idx) => {
                    text += `${idx + 1}. *${m.homeTeam}* vs *${m.awayTeam}*\n`;
                    text += `   🗓️ Date: ${m.date || "Upcoming"} (Matchday ${m.matchday || 1})\n\n`;
                });
                text += `💡 _Usage: \`.fixtures <epl|ucl|laliga|bundesliga|seriea|ligue1|euros|fifa>\`_`;
            } else {
                text += `No upcoming fixtures found for ${endpoint.toUpperCase()}.\n`;
            }

            await sock.sendMessage(jid, { text }, { quoted: msg });
        } catch (err) {
            console.error("fixtures error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Failed to fetch fixtures for ${endpoint}.` }, { quoted: msg });
        }
    }
};

livesportsCommand.gamehistory = {
    name: "gamehistory",
    aliases: ["history"],
    description: "Search match event details and game history.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim() || "Arsenal vs Chelsea";

        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/gameevents?q=${encodeURIComponent(query)}`, { timeout: 10000 });

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const event = res.data.result[0];
                let text = `📜 *GAME EVENTS & HISTORY* 📜\n`;
                text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                text += `⚽ *Match:* ${event.match || query}\n`;
                if (event.league?.name) text += `🏆 *League:* ${event.league.name}\n`;
                if (event.season) text += `🗓️ *Season:* ${event.season}\n`;
                if (event.teams) {
                    const home = event.teams.home?.name || "Home";
                    const away = event.teams.away?.name || "Away";
                    text += `⚔️ *Matchup:* ${home} vs ${away}\n`;
                }
                if (event.venue?.name) text += `🏟️ *Venue:* ${event.venue.name}\n`;

                const imageUrl = event.league?.badge || event.teams?.home?.badge;
                if (imageUrl) {
                    await sock.sendMessage(jid, { image: { url: imageUrl }, caption: text }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(jid, { text: `📜 *Game History:* No events found for *"${query}"*.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("gamehistory error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch game history." }, { quoted: msg });
        }
    }
};

livesportsCommand.stadium = {
    name: "stadium",
    aliases: ["stadiums", "venue"],
    description: "Search details of sports stadiums and venues.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim();
        if (!query) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.stadium <stadium_name>` (e.g. \`.stadium Emirates\`)" }, { quoted: msg });
        }

        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/venuesearch?q=${encodeURIComponent(query)}`, { timeout: 10000 });

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const venue = res.data.result[0];
                let text = `🏟️ *STADIUM / VENUE INFO* 🏟️\n`;
                text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                text += `🏟️ *Name:* ${venue.name}\n`;
                if (venue.alternateName) text += `*Alternate Name:* ${venue.alternateName}\n`;
                if (venue.sport) text += `⚽ *Sport:* ${venue.sport}\n`;
                if (venue.capacity) text += `👥 *Capacity:* ${venue.capacity}\n`;
                if (venue.location) text += `📍 *Location:* ${venue.location}\n`;
                if (venue.country) text += `🌍 *Country:* ${venue.country}\n`;
                if (venue.description) text += `\n📝 *Description:* ${venue.description.slice(0, 300)}...\n`;

                const imageUrl = venue.media?.thumb || venue.media?.logo;
                if (imageUrl) {
                    await sock.sendMessage(jid, { image: { url: imageUrl }, caption: text }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(jid, { text: `🏟️ Stadium *"${query}"* not found.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("stadium error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Failed to look up stadium info: ${err.message}` }, { quoted: msg });
        }
    }
};

livesportsCommand.team = {
    name: "team",
    aliases: ["teams", "teaminfo"],
    description: "Search stats, stadium, and info for a sports team.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim();
        if (!query) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.team <team_name>` (e.g. \`.team Arsenal\`)" }, { quoted: msg });
        }

        const settings = getSettings();
        const botName = settings.botName || "Nexus-MD";

        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/teamsearch?q=${encodeURIComponent(query)}`, { timeout: 10000 });

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const team = res.data.result[0];
                let captionText = `🛡️ *${botName.toUpperCase()} - TEAM INFO* 🛡️\n\n`;
                captionText += `*${team.name}* ${team.shortName ? `[${team.shortName}]` : ""}\n\n`;
                if (team.alternateName) captionText += `*Full Name:* ${team.alternateName}\n`;
                captionText += `⚽ *Sport:* ${team.sport || "Soccer"}\n`;
                captionText += `🏆 *League:* ${team.league || "N/A"}\n`;
                captionText += `📅 *Formed Year:* ${team.formedYear || "N/A"}\n`;
                captionText += `🏟️ *Stadium:* ${team.stadium || "N/A"} (Capacity: ${team.stadiumCapacity || "N/A"})\n`;
                captionText += `📍 *Location:* ${team.location || "N/A"}, ${team.country || ""}\n\n`;
                if (team.description) {
                    captionText += `📝 *About:* ${team.description.slice(0, 350)}...\n`;
                }

                const imageUrl = team.badges?.small || team.badges?.large || team.badges?.banner;
                if (imageUrl) {
                    await sock.sendMessage(jid, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text: captionText }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(jid, { text: `❌ Team *"${query}"* not found.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("Team search API error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Failed to look up team info: ${err.message}` }, { quoted: msg });
        }
    }
};

livesportsCommand.player = {
    name: "player",
    aliases: ["players", "playerinfo"],
    description: "Search info, bio, and stats for a sports player.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim();
        if (!query) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.player <player_name>` (e.g. \`.player Bukayo Saka\`)" }, { quoted: msg });
        }

        const settings = getSettings();
        const botName = settings.botName || "Nexus-MD";

        try {
            const res = await axios.get(`${KEITH_API_BASE}/sport/playersearch?q=${encodeURIComponent(query)}`, { timeout: 10000 });

            if (res.data?.status && Array.isArray(res.data?.result) && res.data.result.length > 0) {
                const player = res.data.result[0];
                let captionText = `👤 *${botName.toUpperCase()} - PLAYER INFO* 👤\n\n`;
                captionText += `*${player.name}*\n\n`;
                captionText += `🏃‍♂️ *Position:* ${player.position || "N/A"}\n`;
                captionText += `🏡 *Team:* ${player.team || "N/A"}\n`;
                captionText += `⚽ *Sport:* ${player.sport || "Soccer"}\n`;
                captionText += `🌍 *Nationality:* ${player.nationality || "N/A"}\n`;
                captionText += `📅 *Birth Date:* ${player.birthDate || "N/A"}\n`;
                captionText += `⚡ *Status:* ${player.status || "Active"}\n`;
                captionText += `🚻 *Gender:* ${player.gender || "N/A"}\n`;

                const imageUrl = player.thumbnail || player.cutout;
                if (imageUrl) {
                    await sock.sendMessage(jid, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text: captionText }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(jid, { text: `❌ Player *"${query}"* not found.` }, { quoted: msg });
            }
        } catch (err) {
            console.error("Player search API error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Failed to look up player info: ${err.message}` }, { quoted: msg });
        }
    }
};

module.exports = livesportsCommand;
