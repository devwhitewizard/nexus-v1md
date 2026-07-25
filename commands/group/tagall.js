module.exports = {
    name: "tagall",
    description: "Mentions all group members.",
    category: "group",
    adminOnly: false,
    groupOnly: true,
    async execute({ sock, jid, sender, args, msg }) {
        try {
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants;
            const message = args.join(" ") || "Attention everyone!";
            
            let mentions = [];
            let response = `📢 *TAG ALL*\n\n*Message:* ${message}\n\n`;
            
            participants.forEach((i, idx) => {
                response += `${idx + 1}. @${i.id.split("@")[0]}\n`;
                mentions.push(i.id);
            });

            await sock.sendMessage(jid, { text: response, mentions: mentions }, { quoted: msg });
        } catch (err) {
            console.error("Tagall error:", err);
            await sock.sendMessage(jid, { text: "❌ Error fetching group metadata." });
        }
    }
};
