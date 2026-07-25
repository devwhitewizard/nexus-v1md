module.exports = {
    name: "hidetag",
    description: "Mentions everyone silently (ghost tagging).",
    category: "group",
    adminOnly: true,
    groupOnly: true,
    async execute({ sock, jid, args, msg }) {
        try {
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants.map(p => p.id);
            const message = args.join(" ") || "Hey everyone! (Message from Admin)";

            await sock.sendMessage(jid, { text: message, mentions: participants }, { quoted: msg });
        } catch (err) {
            console.error("Hidetag error:", err);
        }
    }
};
