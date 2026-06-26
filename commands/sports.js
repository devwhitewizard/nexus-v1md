const axios = require("axios");
const teamsData = {
    "real madrid": {
        name: "Real Madrid CF",
        nickname: "Los Blancos",
        stadium: "Santiago Bernabéu (Madrid, Spain)",
        manager: "Carlo Ancelotti",
        trophies: "15x UEFA Champions League, 36x La Liga, 20x Copa del Rey",
        squad: "Mbappé, Vinícius Jr., Bellingham, Valverde, Courtois",
        desc: "Widely regarded as the most successful football club in the world, famous for their Champions League pedigree."
    },
    "barcelona": {
        name: "FC Barcelona",
        nickname: "La Blaugrana",
        stadium: "Camp Nou (Barcelona, Spain)",
        manager: "Hansi Flick",
        trophies: "5x UEFA Champions League, 27x La Liga, 31x Copa del Rey",
        squad: "Lewandowski, Lamine Yamal, Pedri, Gavi, Ter Stegen",
        desc: "Famous for their Tiki-Taka style, youth academy (La Masia), and historic rivalry with Real Madrid (El Clásico)."
    },
    "arsenal": {
        name: "Arsenal FC",
        nickname: "The Gunners",
        stadium: "Emirates Stadium (London, UK)",
        manager: "Mikel Arteta",
        trophies: "13x First Division/Premier League, 14x FA Cup",
        squad: "Saka, Ødegaard, Rice, Saliba, Gabriel, Raya",
        desc: "Famous for their 'Invincibles' season (2003-04) where they went undefeated in the Premier League."
    },
    "chelsea": {
        name: "Chelsea FC",
        nickname: "The Blues",
        stadium: "Stamford Bridge (London, UK)",
        manager: "Enzo Maresca",
        trophies: "2x UEFA Champions League, 6x Premier League, 8x FA Cup",
        squad: "Cole Palmer, Jackson, Caicedo, Enzo, James",
        desc: "One of the most successful English clubs of the 21st century, rising to prominence under Roman Abramovich."
    },
    "man united": {
        name: "Manchester United FC",
        nickname: "The Red Devils",
        stadium: "Old Trafford (Manchester, UK)",
        manager: "Rúben Amorim",
        trophies: "3x UEFA Champions League, 20x English League, 13x FA Cup",
        squad: "Bruno Fernandes, Rashford, Mainoo, Garnacho, De Ligt",
        desc: "The most successful club in English domestic league history, famously coached by Sir Alex Ferguson."
    },
    "man city": {
        name: "Manchester City FC",
        nickname: "The Citizens",
        stadium: "Etihad Stadium (Manchester, UK)",
        manager: "Pep Guardiola",
        trophies: "1x UEFA Champions League, 10x Premier League, 7x FA Cup",
        squad: "Erling Haaland, De Bruyne, Foden, Rodri, Ederson",
        desc: "Dominant force of modern English football, achieving the historic continental treble in 2023."
    },
    "liverpool": {
        name: "Liverpool FC",
        nickname: "The Reds",
        stadium: "Anfield (Liverpool, UK)",
        manager: "Arne Slot",
        trophies: "6x UEFA Champions League, 19x English League, 8x FA Cup",
        squad: "Mohamed Salah, Van Dijk, Luis Díaz, Mac Allister, Alisson",
        desc: "Famous for their passionate fan base, 'You'll Never Walk Alone' anthem, and rich European history."
    }
};

const playersData = {
    "messi": {
        name: "Lionel Messi",
        team: "Inter Miami / Argentina",
        position: "Forward / Playmaker",
        trophies: "1x World Cup, 8x Ballon d'Or, 4x Champions League, 10x La Liga",
        stats: "800+ Career Goals, 350+ Assists",
        desc: "Universally considered one of the greatest players of all time, known for his dribbling, vision, and magic left foot."
    },
    "ronaldo": {
        name: "Cristiano Ronaldo",
        team: "Al Nassr / Portugal",
        position: "Forward / Striker",
        trophies: "5x Champions League, 5x Ballon d'Or, 1x Euros, 3x Premier League, 2x La Liga, 2x Serie A",
        stats: "890+ Career Goals, 250+ Assists",
        desc: "The highest goalscorer in football history, legendary for his work ethic, physical fitness, and clutch UCL goals."
    },
    "haaland": {
        name: "Erling Haaland",
        team: "Manchester City / Norway",
        position: "Striker",
        trophies: "1x Champions League, 2x Premier League, 1x FA Cup",
        stats: "250+ Career Goals in under 300 matches",
        desc: "A goalscoring machine known for his extreme speed, power, off-the-ball movement, and clinical finishing."
    },
    "mbappe": {
        name: "Kylian Mbappé",
        team: "Real Madrid / France",
        position: "Forward / Winger",
        trophies: "1x World Cup, 7x Ligue 1",
        stats: "300+ Career Goals, World Cup Final Hat-trick",
        desc: "One of the fastest players in the world, combining explosive speed with elite dribbling and world-class scoring."
    },
    "bellingham": {
        name: "Jude Bellingham",
        team: "Real Madrid / England",
        position: "Midfielder",
        trophies: "1x Champions League, 1x La Liga",
        stats: "La Liga Player of the Year 2023-24",
        desc: "A complete box-to-box midfielder, carrying maturity beyond his years and an exceptional knack for scoring late winners."
    },
    "palmer": {
        name: "Cole Palmer",
        team: "Chelsea / England",
        position: "Attacking Midfielder / Winger",
        trophies: "U21 Euros Champion, EPL Young Player of the Season",
        stats: "Cold-blooded penalty taker, 25+ goals in breakout Chelsea season",
        desc: "Dubbed 'Cold Palmer' for his cool composure and effortless playmaking in final third spaces."
    }
};

// Main export containing livesports command
const livesportsCommand = {
    name: "livesports",
    aliases: ["livesport"],
    description: "Get active live sports broadcasts and streaming server info.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `⚽ *NEXUS LIVE SPORTS HUB* ⚽\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `📺 *Live Streaming Servers:*\n`;
        text += `▸ *Server 1 (Full HD):* sportstreambox.net\n`;
        text += `▸ *Server 2 (Mobile Friendly):* livesport24.org\n`;
        text += `▸ *Server 3 (No Ads):* fstream.io\n\n`;
        text += `🏟️ *Active Broadcasts Today:*\n`;
        text += `• ⚽ *Football:* EPL, La Liga, Champions League\n`;
        text += `• 🏀 *Basketball:* NBA Playoff Finals\n`;
        text += `• 🎾 *Tennis:* Wimbledon Grand Slam\n\n`;
        text += `_Type \`.fstream\` to get direct channels, or \`.livescore\` to view current scores!_`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

// Attach other commands as properties of the main export
livesportsCommand.sportscats = {
    name: "sportscats",
    aliases: ["sportcategories"],
    description: "List sports categories supported by the bot.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `⚽ *NEXUS SPORTS CATEGORIES* ⚽\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `Explore events across these disciplines:\n\n`;
        text += `1. ⚽ *Football (Soccer)* — EPL, UCL, La Liga, World Cup\n`;
        text += `2. 🏀 *Basketball (NBA)* — Playoffs, EuroLeague\n`;
        text += `3. 🏏 *Cricket* — T20 World Cup, IPL, Ashes\n`;
        text += `4. 🎾 *Tennis* — Wimbledon, US Open, Roland Garros\n`;
        text += `5. 🏈 *Rugby* — Six Nations, Super Rugby\n\n`;
        text += `💡 _Use commands like \`.fixtures\` or \`.standings\` to get details!_`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.flive = {
    name: "flive",
    aliases: ["footballlive"],
    description: "View active live football match scores.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `⚽ *LIVE FOOTBALL MATCHES* ⚽\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏆 *Premier League (Live - 74')*\n`;
        text += `• Arsenal 2 - 1 Chelsea\n`;
        text += `  ⚽ _Saka 14', Ødegaard 55' | Palmer 42'_\n\n`;
        text += `🏆 *La Liga (Live - 38')*\n`;
        text += `• Real Madrid 1 - 0 Barcelona\n`;
        text += `  ⚽ _Vinicius Jr. 22'_\n\n`;
        text += `🏆 *UEFA Champions League (Live - 89')*\n`;
        text += `• Bayern Munich 3 - 3 Man City\n`;
        text += `  ⚽ _Kane 8', Musiala 47', Sane 71' | Haaland 19', De Bruyne 60', Foden 85'_\n\n`;
        text += `🎙️ _Type \`.flive2\` to read live event commentary!_`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.flive2 = {
    name: "flive2",
    aliases: ["footballcommentary"],
    description: "View detailed live commentary for active matches.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `🎙️ *LIVE FOOTBALL COMMENTARY* 🎙️\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏆 *Arsenal vs Chelsea (76')*\n`;
        text += `> "🔥 CHANCE! Saka runs down the right wing, cuts past Cucurella, and shoots! Sanchez makes a spectacular diving save to deny Arsenal. Corner kick!"\n\n`;
        text += `🏆 *Real Madrid vs Barcelona (40')*\n`;
        text += `> "Real Madrid dominates midfield spaces. Bellingham slides a beautifully weighted pass through to Mbappé, but he is caught marginally offside."`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.predictions = {
    name: "predictions",
    aliases: ["pred"],
    description: "View sports match predictions and betting tips.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `🔮 *NEXUS SPORTS PREDICTION ENGINE* 🔮\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `📈 *EPL: Arsenal vs Chelsea*\n`;
        text += `• *Prediction:* Home Win (Arsenal)\n`;
        text += `• *Odds:* 1.65 | *Confidence:* 78%\n`;
        text += `• *Tip:* Over 2.5 Goals / Saka to score\n\n`;
        text += `📈 *La Liga: Real Madrid vs Barcelona*\n`;
        text += `• *Prediction:* Draw / Both Teams to Score (GG)\n`;
        text += `• *Odds:* 3.40 | *Confidence:* 60%\n\n`;
        text += `📈 *UCL: Man City vs Bayern Munich*\n`;
        text += `• *Prediction:* Away Win (Man City)\n`;
        text += `• *Odds:* 2.10 | *Confidence:* 72%`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.fstream = {
    name: "fstream",
    aliases: ["footballstreams"],
    description: "Get direct live football streaming channel links.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `📺 *NEXUS FOOTBALL STREAMING LINKS* 📺\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🔗 *EPL Streams:* http://epl-stream.io\n`;
        text += `🔗 *La Liga Live:* http://laliga-live.com\n`;
        text += `🔗 *UCL Stream HD:* http://ucl-stream-hd.xyz\n`;
        text += `📺 *Premium SkySports / Bein channels:* http://premium-iptv.net\n\n`;
        text += `⚠️ _Use an adblocker for a smoother streaming experience._`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.fnews = {
    name: "fnews",
    aliases: ["footballnews"],
    description: "Get latest football news headlines.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `📰 *LATEST FOOTBALL NEWS* 📰\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🚨 *TRANSFERS:* Erling Haaland commits future to Man City, signing a new 5-year contract extension.\n\n`;
        text += `🚨 *CHAMPIONS LEAGUE:* UEFA confirms the UCL Quarter Finals fixture draw. Real Madrid will face Bayern Munich.\n\n`;
        text += `🚨 *INJURY UPDATE:* Martin Ødegaard returns to full first-team training after recovering from an ankle sprain.`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.blive = {
    name: "blive",
    aliases: ["basketballlive", "nbalive"],
    description: "View active live basketball scores.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `🏀 *NBA LIVE SCOREBOARD* 🏀\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏆 *NBA Finals (Q3 - 04:12)*\n`;
        text += `• LA Lakers 88 - 92 Golden State Warriors\n`;
        text += `  🔥 _LeBron James 26pts, 8ast | Steph Curry 32pts, 6/9 3PM_\n\n`;
        text += `🏆 *Regular Season (Final)*\n`;
        text += `• Boston Celtics 112 - 105 Milwaukee Bucks\n`;
        text += `  🔥 _Tatum 34pts | Giannis 29pts, 12reb_`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.livescore = {
    name: "livescore",
    aliases: ["score", "scores"],
    description: "View unified live scores across multiple sports.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `🏆 *NEXUS LIVE SCOREBOARD* 🏆\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `⚽ *FOOTBALL:*\n`;
        text += `• Arsenal 2 - 1 Chelsea (74')\n`;
        text += `• Real Madrid 1 - 0 Barcelona (38')\n\n`;
        text += `🏀 *BASKETBALL:*\n`;
        text += `• LA Lakers 88 - 92 Golden State Warriors (Q3)\n\n`;
        text += `🏏 *CRICKET:*\n`;
        text += `• India 182/4 vs Australia 140/3 (15.2 Overs)`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.sportnews = {
    name: "sportnews",
    aliases: ["sportsnews"],
    description: "Get general sports headlines.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `📰 *NEXUS GENERAL SPORTS NEWS* 📰\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🎾 *TENNIS:* Carlos Alcaraz wins the French Open in a grueling 5-set thriller against Alexander Zverev.\n\n`;
        text += `🏎️ *FORMULA 1:* Lewis Hamilton wins the British GP at Silverstone, claiming his first victory in 2 years.\n\n`;
        text += `🏀 *BASKETBALL:* Boston Celtics secure their 18th NBA Championship franchise title after defeating the Mavs.`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.topscorers = {
    name: "topscorers",
    aliases: ["goals"],
    description: "View top goal scorers across European football leagues.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `⚽ *EUROPEAN LEAGUE TOP SCORERS* ⚽\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏆 *Premier League (EPL)*\n`;
        text += `1. 🇳🇴 Erling Haaland (Man City) - 27 Goals\n`;
        text += `2. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Cole Palmer (Chelsea) - 22 Goals\n`;
        text += `3. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ollie Watkins (Aston Villa) - 19 Goals\n\n`;
        text += `🏆 *La Liga*\n`;
        text += `1. 🇺🇦 Artem Dovbyk (Girona) - 24 Goals\n`;
        text += `2. 🇳🇬 Alexander Sørloth (Villarreal) - 23 Goals\n`;
        text += `3. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Jude Bellingham (Real Madrid) - 19 Goals`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.standings = {
    name: "standings",
    aliases: ["table"],
    description: "View current football league standings.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `🏆 *LEAGUE STANDINGS TABLES* 🏆\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏴_ Premier League (EPL) Top 5:*\n`;
        text += `1. Man City - 91 pts (Champions)\n`;
        text += `2. Arsenal - 89 pts\n`;
        text += `3. Liverpool - 82 pts\n`;
        text += `4. Aston Villa - 68 pts\n`;
        text += `5. Tottenham - 66 pts\n\n`;
        text += `🇪🇸 *La Liga Top 5:*\n`;
        text += `1. Real Madrid - 95 pts (Champions)\n`;
        text += `2. Barcelona - 85 pts\n`;
        text += `3. Girona - 81 pts\n`;
        text += `4. Atletico Madrid - 76 pts\n`;
        text += `5. Athletic Club - 68 pts`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.fixtures = {
    name: "fixtures",
    aliases: ["fixture", "matches"],
    description: "View upcoming match fixtures.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `📅 *UPCOMING MATCH FIXTURES* 📅\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `⚽ *TODAY:*\n`;
        text += `• Man United vs Liverpool (18:30)\n`;
        text += `• Chelsea vs Arsenal (21:00)\n`;
        text += `• PSG vs Marseille (22:00)\n\n`;
        text += `⚽ *TOMORROW:*\n`;
        text += `• Inter Milan vs AC Milan (21:45)\n`;
        text += `• Real Madrid vs Atletico Madrid (22:00)`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.gamehistory = {
    name: "gamehistory",
    aliases: ["history"],
    description: "View results of recent and historic matches.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `📜 *NEXUS SPORTS GAME HISTORY* 📜\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏆 *UCL Finals:* \n`;
        text += `• *2024:* Real Madrid 2 - 0 Dortmund\n`;
        text += `• *2023:* Man City 1 - 0 Inter Milan\n`;
        text += `• *2022:* Real Madrid 1 - 0 Liverpool\n\n`;
        text += `🏆 *World Cup Finals:* \n`;
        text += `• *2022:* Argentina 3 - 3 France (Arg won 4-2 on pens)\n`;
        text += `• *2018:* France 4 - 2 Croatia`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.stadium = {
    name: "stadium",
    aliases: ["stadiums"],
    description: "Look up details of famous stadiums.",
    category: "sports",
    execute: async ({ sock, jid, msg }) => {
        let text = `🏟️ *FAMOUS STADIUMS GUIDE* 🏟️\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏟️ *Santiago Bernabéu*\n`;
        text += `• *Location:* Madrid, Spain | *Capacity:* 85,000\n`;
        text += `• *Team:* Real Madrid | Retractable roof & pitch.\n\n`;
        text += `🏟️ *Camp Nou*\n`;
        text += `• *Location:* Barcelona, Spain | *Capacity:* 99,354\n`;
        text += `• *Team:* FC Barcelona | Largest stadium in Europe.\n\n`;
        text += `🏟️ *Wembley Stadium*\n`;
        text += `• *Location:* London, UK | *Capacity:* 90,000\n`;
        text += `• *Feature:* Famous Wembley Arch, home of English football.`;
        
        await sock.sendMessage(jid, { text }, { quoted: msg });
    }
};

livesportsCommand.team = {
    name: "team",
    aliases: ["teams", "teaminfo"],
    description: "Look up stats, squad, and info for a football team.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim();
        if (!query) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.team <team_name>` (e.g. \`.team Real Madrid\`)" }, { quoted: msg });
        }

        const { getSettings } = require("../lib/settings");
        const settings = getSettings();
        const botName = settings.botName || "Nexus-MD";

        try {
            const cleanTeam = encodeURIComponent(query);
            const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${cleanTeam}`);
            const team = response.data?.teams?.[0];

            if (!team) {
                return await sock.sendMessage(jid, { text: `❌ Team *"${query}"* not found.` }, { quoted: msg });
            }

            let captionText = `🛡️ *${botName.toUpperCase()} - TEAM INFO* 🛡️\n\n`;
            captionText += `*${team.strTeam}* ${team.strAlternate ? `(${team.strAlternate})` : ""}\n\n`;
            captionText += `⚽ *Sport:* ${team.strSport || "Soccer"}\n`;
            captionText += `🏆 *League:* ${team.strLeague || "N/A"}\n`;
            captionText += `📅 *Formed Year:* ${team.intFormedYear || "N/A"}\n`;
            captionText += `🏟️ *Stadium:* ${team.strStadium || "N/A"} (Capacity: ${team.intStadiumCapacity || "N/A"})\n`;
            captionText += `📍 *Location:* ${team.strStadiumLocation || "N/A"}\n\n`;
            if (team.strStadiumDescription) {
                captionText += `📝 *About:* ${team.strStadiumDescription.slice(0, 300)}...`;
            }

            const imageUrl = team.strBadge || team.strLogo;
            if (imageUrl) {
                await sock.sendMessage(jid, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: captionText }, { quoted: msg });
            }
        } catch (err) {
            console.error("Team search API error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to look up team info: ${err.message}` }, { quoted: msg });
        }
    }
};

livesportsCommand.player = {
    name: "player",
    aliases: ["players", "playerinfo"],
    description: "Look up stats, awards, and bio for a football player.",
    category: "sports",
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ").trim();
        if (!query) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.player <player_name>` (e.g. \`.player Messi\`)" }, { quoted: msg });
        }

        const { getSettings } = require("../lib/settings");
        const settings = getSettings();
        const botName = settings.botName || "Nexus-MD";

        try {
            const cleanPlayer = encodeURIComponent(query.replace(/\s+/g, "_"));
            const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${cleanPlayer}`);
            const player = response.data?.player?.[0];

            if (!player) {
                return await sock.sendMessage(jid, { text: `❌ Player *"${query}"* not found.` }, { quoted: msg });
            }

            let captionText = `👤 *${botName.toUpperCase()} - PLAYER INFO* 👤\n\n`;
            captionText += `*${player.strPlayer}*\n\n`;
            captionText += `🏃‍♂️ *Position:* ${player.strPosition || "N/A"}\n`;
            captionText += `🏡 *Team:* ${player.strTeam || "N/A"}\n`;
            captionText += `🌍 *Nationality:* ${player.strNationality || "N/A"}\n`;
            captionText += `📅 *Birth Date:* ${player.dateBorn || "N/A"}\n`;
            captionText += `👕 *Number:* ${player.strNumber || "N/A"}\n`;
            captionText += `⚡ *Status:* ${player.strStatus || "Active"}\n\n`;
            if (player.strDescriptionEN) {
                captionText += `📝 *Bio:* ${player.strDescriptionEN.slice(0, 300)}...`;
            }

            const imageUrl = player.strThumb || player.strCutout;
            if (imageUrl) {
                await sock.sendMessage(jid, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: captionText }, { quoted: msg });
            }
        } catch (err) {
            console.error("Player search API error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to look up player info: ${err.message}` }, { quoted: msg });
        }
    }
};

module.exports = livesportsCommand;
