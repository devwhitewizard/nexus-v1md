module.exports = {
    name: "hack",
    description: "Launch a fake hacking prank on a user.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        if (!mentioned) {
            return await sock.sendMessage(jid, { text: "❓ *Usage:* `.hack @user`" });
        }

        const pushName = mentioned.split("@")[0];
        
        // Initial message
        await sock.sendMessage(jid, { text: `💻 *Establishing secure connection to @${pushName}'s device...*`, mentions: [mentioned] });

        // Prank sequence
        const steps = [
            "📡 Searching for vulnerabilities in firewall...",
            "🔓 Entry point found: Port 433 (Secure Socket).",
            "💾 Extracting cloud storage backup...",
            "📂 *Critical files found:* `browser_history.log`, `passwords.vault`.",
            "🖼️ Accessing gallery... (Found 4,032 selfie photos).",
            "🕵️ Injecting hidden micro-spyware...",
            "💀 *HACK COMPLETE.* Data uploaded to Nexus Darkweb.",
            "⚠️ _Note: This is a prank. No data was actually accessed._"
        ];

        let i = 0;
        const interval = setInterval(async () => {
            if (i >= steps.length) {
                clearInterval(interval);
                return;
            }
            
            await sock.sendMessage(jid, { text: `🕹️ ${steps[i]}` });
            i++;
        }, 1200);
    }
};
