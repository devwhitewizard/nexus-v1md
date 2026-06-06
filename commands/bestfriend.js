module.exports = {
    name: "bestfriend",
    aliases: ["bf"],
    description: "Find your random best friend in the group!",
    category: "fun",
    groupOnly: true,
    async execute({ sock, jid, sender, msg }) {
        try {
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants.map(p => p.id).filter(id => id !== sender);

            if (participants.length === 0) {
                return await sock.sendMessage(jid, { text: "😔 *You are the only member here!* I'll be your best friend for now!" }, { quoted: msg });
            }

            const bfJid = participants[Math.floor(Math.random() * participants.length)];
            const bfId = bfJid.split("@")[0];
            const senderId = sender.split("@")[0];

            const response = 
                `🤝 *Best Friend Found!* 🤝\n\n` +
                `@${senderId}, your best friend is @${bfId}!\n\n` +
                `👫 *Friends forever!*`;

            await sock.sendMessage(jid, { 
                text: response, 
                mentions: [sender, bfJid] 
            }, { quoted: msg });

        } catch (error) {
            console.error("Bestfriend Command Error:", error);
            await sock.sendMessage(jid, { text: "❌ Error connecting to group metadata." });
        }
    }
};
