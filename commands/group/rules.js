const { getRules } = require("../../database/rules");

module.exports = {
    name: "rules",
    description: "Show group rules.",
    category: "group",
    groupOnly: true,
    async execute({ sock, jid, msg }) {
        try {
            const rulesText = await getRules(jid);
            const metadata = await sock.groupMetadata(jid);
            
            const response = `📜 *RULES: ${metadata.subject}*\n\n${rulesText}\n\n_Keep the group healthy and follow the guidelines!_`;
            
            await sock.sendMessage(jid, { text: response }, { quoted: msg });
        } catch (err) {
            console.error("Rules fetch error:", err);
        }
    }
};
