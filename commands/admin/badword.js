const { addBadword, removeBadword, getBadwords } = require("../../database/badwords");

module.exports = {
    name: "badword",
    aliases: ["bw"],
    description: "Manage offensive words filter.",
    category: "admin",
    adminOnly: true,
    async execute({ sock, jid, args }) {
        const action = args[0]?.toLowerCase();
        const word = args.slice(1).join(" ");

        if (action === "add" && word) {
            await addBadword(word);
            await sock.sendMessage(jid, { text: `✅ *Badword Added:* "${word}" is now blacklisted.` });
        } else if (action === "remove" && word) {
            await removeBadword(word);
            await sock.sendMessage(jid, { text: `✅ *Badword Removed:* "${word}" is no longer filtered.` });
        } else if (action === "list") {
            const list = await getBadwords();
            await sock.sendMessage(jid, { text: `📜 *FILTERED WORDS:*\n\n${list.join(", ") || "(empty)"}` });
        } else {
            await sock.sendMessage(jid, { text: "❓ *Usage:*\n.badword add [word]\n.badword remove [word]\n.badword list" });
        }
    }
};
