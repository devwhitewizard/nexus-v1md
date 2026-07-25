module.exports = {
    name: "scan",
    description: "Perform a deep-space analysis of a user (Fun).",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.scan @user`" });
        }

        const pushName = mentioned.split("@")[0];
        
        await sock.sendMessage(jid, { text: `📡 *Initializing Quantum Scan for @${pushName}...*` }, { mentions: [mentioned] });

        // Fake delays for immersion
        setTimeout(async () => {
            const dataBlocks = [
                "▓▓▓▒▒▒▒▒▒▒ 30% - Decrypting personality matrix...",
                "▓▓▓▓▓▓▒▒▒▒ 65% - Analyzing chat history patterns...",
                "▓▓▓▓▓▓▓▓▓▓ 100% - Scan Complete. Generating results."
            ];

            for (const step of dataBlocks) {
                await new Promise(res => setTimeout(res, 800));
                // We're inside a timeout, sending messages individually
            }

            const traits = ["Loyal 🛡️", "Chaos Agent 🌪️", "Ghost 👻", "Chatterbox 🦜", "Simp 🥺", "Legend 🏅", "Meme Lord 🤡", "The Quiet One 🤐"];
            const danger = Math.floor(Math.random() * 101);
            const trust = Math.floor(Math.random() * 101);
            const trait = traits[Math.floor(Math.random() * traits.length)];

            const result = 
                `🌌 *SCAN ANALYSIS: @${pushName}*\n\n` +
                `🎭 *Dominant Trait:* ${trait}\n` +
                `⚠️ *Danger Level:* ${danger}%\n` +
                `🤝 *Trust Quotient:* ${trust}%\n` +
                `📜 *System Note:* ${danger > 80 ? "Treat with extreme caution." : "Relatively harmless."}\n\n` +
                `_Nexus-1MD Neural Scan Complete_`;

            await sock.sendMessage(jid, { text: result, mentions: [mentioned] });
        }, 1000);
    }
};
