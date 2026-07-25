const mediaApi = require("../../lib/mediaApi");

module.exports = {
    name: "lyrics",
    aliases: ["lyric", "songlyrics"],
    description: "Get the lyrics for a song.",
    category: "media",
    cooldown: 5000,
    execute: async ({ sock, jid, args, msg }) => {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(jid, { 
                text: "❓ *Usage:* `.lyrics <song name>`\n\n*Examples:*\n• `.lyrics Blinding Lights`\n• `.lyrics Perfect Ed Sheeran`" 
            });
        }

        try {
            await sock.sendPresenceUpdate('composing', jid);
            await sock.sendMessage(jid, { text: `🔍 Searching for lyrics: *${query}*...` });


            const lyricsData = await mediaApi.getLyrics(query);

            if (!lyricsData || !lyricsData.lyrics) {
                return await sock.sendMessage(jid, { text: `❌ Could not find lyrics for: *${query}*` });
            }

            const { lyrics, title, artist, album } = lyricsData;
            const truncated = lyrics.length > 4000 ? lyrics.substring(0, 4000) + "...\n\n_Lyrics too long..._" : lyrics;

            const caption = 
                `🎵 *SONG LYRICS*\n━━━━━━━━━━━━━━━━━━━\n` +
                `🎼 *Title:* ${title}\n` +
                `👤 *Artist:* ${artist}\n` +
                (album ? `💿 *Album:* ${album}\n\n` : `\n`) +
                `${truncated}\n\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `_Nexus-1MD Media Hub_`;

            await sock.sendMessage(jid, { text: caption }, { quoted: msg });

        } catch (error) {
            console.error("Lyrics command error:", error);
            await sock.sendMessage(jid, { text: "❌ Oops! Something went wrong while fetching lyrics. Please try again later." });
        }
    }
};

