module.exports = {
    name: "time",
    aliases: ["clock"],
    description: "Check current system time.",
    category: "general",
    async execute({ sock, jid, msg }) {
        const date = new Date().toLocaleDateString("en-KE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const time = new Date().toLocaleTimeString("en-KE", { hour12: true });

        const timeText = `🕒 *CURRENT TIME*\n\n📅 *Date:* ${date}\n⌚ *Time:* ${time}\n\n_Nexus Clock Precision_`;
        
        await sock.sendMessage(jid, { text: timeText }, { quoted: msg });
    }
};
