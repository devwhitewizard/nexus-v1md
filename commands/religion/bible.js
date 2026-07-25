const axios = require("axios");

// Book mapping from ID to Name
const BIBLE_BOOKS = {
    1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
    6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
    11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles",
    15: "Ezra", 16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms",
    20: "Proverbs", 21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah",
    24: "Jeremiah", 25: "Lamentations", 26: "Ezekiel", 27: "Daniel",
    28: "Hosea", 29: "Joel", 30: "Amos", 31: "Obadiah", 32: "Jonah",
    33: "Micah", 34: "Nahum", 35: "Habakkuk", 36: "Zephaniah", 37: "Haggai",
    38: "Zechariah", 39: "Malachi",
    40: "Matthew", 41: "Mark", 42: "Luke", 43: "John", 44: "Acts",
    45: "Romans", 46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians",
    49: "Ephesians", 50: "Philippians", 51: "Colossians", 52: "1 Thessalonians",
    53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy", 56: "Titus",
    57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter", 61: "2 Peter",
    62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
};

module.exports = {
    name: "bible",
    aliases: ["scripture", "verse"],
    description: "Lookup a Bible verse or search for verses by keywords.",
    category: "religion",
    async execute({ sock, jid, msg, args }) {
        if (args.length === 0) {
            return await sock.sendMessage(jid, {
                text: `📖 *Bible Feature Help*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                     `*1. Verse Lookup:*\n` +
                     `👉 \`.bible <book> <chapter>:<verse>\`\n` +
                     `Example: \`.bible John 3:16\` or \`.bible Genesis 1:1\`\n\n` +
                     `*2. Keyword Search:*\n` +
                     `👉 \`.bible search <keyword>\`\n` +
                     `Example: \`.bible search faith\` or \`.bible search love\``
            }, { quoted: msg });
        }

        const isSearch = args[0].toLowerCase() === "search";

        if (isSearch) {
            const query = args.slice(1).join(" ").trim();
            if (!query) {
                return await sock.sendMessage(jid, { text: "❌ Please provide a keyword to search for. Example: \`.bible search hope\`" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { text: `🔍 Searching Bible for *"${query}"*...` }, { quoted: msg });
                
                const response = await axios.get(`https://bolls.life/v2/find/KJV?search=${encodeURIComponent(query)}`);
                const results = response.data.results;

                if (!results || results.length === 0) {
                    return await sock.sendMessage(jid, { text: `❌ No verses found matching *"${query}"*.` }, { quoted: msg });
                }

                // Show top 7 results
                const maxResults = Math.min(results.length, 7);
                let responseText = `📖 *Bible Search results for "${query}"* (${results.length} found):\n━━━━━━━━━━━━━━━━━━━\n\n`;

                for (let i = 0; i < maxResults; i++) {
                    const item = results[i];
                    const bookName = BIBLE_BOOKS[item.book] || `Book ${item.book}`;
                    const cleanText = item.text.replace(/<S>\d+<\/S>/gi, "").replace(/<[^>]*>/g, "").replace(/\[\d+\]/g, "").trim();
                    responseText += `📍 *${bookName} ${item.chapter}:${item.verse}*\n`;
                    responseText += `> ${cleanText}\n\n`;
                }

                if (results.length > maxResults) {
                    responseText += `_...and ${results.length - maxResults} more matches. Narrow down your keyword for better results._`;
                }

                return await sock.sendMessage(jid, { text: responseText }, { quoted: msg });
            } catch (err) {
                console.error("Bible Search Error:", err);
                return await sock.sendMessage(jid, { text: "❌ Failed to search Bible verses. Please try again later." }, { quoted: msg });
            }
        } else {
            // Verse Lookup
            const lookupQuery = args.join(" ").trim();
            try {
                const response = await axios.get(`https://bible-api.com/${encodeURIComponent(lookupQuery)}`);
                const data = response.data;

                if (!data.text) {
                    return await sock.sendMessage(jid, { text: `❌ Could not find verse *"${lookupQuery}"*. Check spelling or format (e.g. John 3:16).` }, { quoted: msg });
                }

                const cleanText = data.text.trim();
                const responseText = `📖 *BIBLE VERSE: ${data.reference}*\n` +
                                     `━━━━━━━━━━━━━━━━━━━\n\n` +
                                     `> ${cleanText}\n\n` +
                                     `*Translation:* ${data.translation_name}`;

                return await sock.sendMessage(jid, { text: responseText }, { quoted: msg });
            } catch (err) {
                // Try to search if lookup fails (as a smart fallback)
                try {
                    const searchFallback = await axios.get(`https://bolls.life/v2/find/KJV?search=${encodeURIComponent(lookupQuery)}`);
                    const results = searchFallback.data.results;
                    if (results && results.length > 0) {
                        const item = results[0];
                        const bookName = BIBLE_BOOKS[item.book] || `Book ${item.book}`;
                        const cleanText = item.text.replace(/<S>\d+<\/S>/gi, "").replace(/<[^>]*>/g, "").replace(/\[\d+\]/g, "").trim();
                        const responseText = `📖 *BIBLE VERSE: ${bookName} ${item.chapter}:${item.verse}*\n` +
                                             `━━━━━━━━━━━━━━━━━━━\n\n` +
                                             `> ${cleanText}\n\n` +
                                             `*Translation:* King James Version (KJV)`;
                        return await sock.sendMessage(jid, { text: responseText }, { quoted: msg });
                    }
                } catch (_) {}

                console.error("Bible Lookup Error:", err.message);
                return await sock.sendMessage(jid, { text: `❌ Could not resolve *"${lookupQuery}"*. Please use standard format, e.g. \`.bible John 3:16\`` }, { quoted: msg });
            }
        }
    }
};
