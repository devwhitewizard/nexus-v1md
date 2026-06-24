const dns = require("dns").promises;

module.exports = {
    name: "dnschecker",
    aliases: ["dns", "dnslookup"],
    description: "Check DNS records of a domain (A, AAAA, MX, TXT)",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        let host = args[0];

        if (!host) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.dnschecker <domain_name>`\n\n*Example:*\n▸ `.dnschecker google.com`" }, { quoted: msg });
        }

        // Clean protocol/paths if user typed a full URL
        host = host.replace(/https?:\/\//i, '').split('/')[0].split(':')[0].trim();

        try {
            await sock.sendMessage(jid, { text: `⏳ Resolving DNS records for *${host}*...` }, { quoted: msg });

            const [a, aaaa, mx, txt] = await Promise.all([
                dns.resolve4(host).catch(() => []),
                dns.resolve6(host).catch(() => []),
                dns.resolveMx(host).catch(() => []),
                dns.resolveTxt(host).catch(() => [])
            ]);

            if (a.length === 0 && aaaa.length === 0 && mx.length === 0 && txt.length === 0) {
                return await sock.sendMessage(jid, { text: `❌ Could not resolve any DNS records for *${host}*. Make sure the domain name is valid.` }, { quoted: msg });
            }

            let reply = `🌐 *DNS RECORDS FOR ${host.toUpperCase()}*\n\n`;

            if (a.length > 0) {
                reply += `📌 *IPv4 Addresses (A):*\n` + a.map(ip => `▸ ${ip}`).join("\n") + `\n\n`;
            }
            if (aaaa.length > 0) {
                reply += `📌 *IPv6 Addresses (AAAA):*\n` + aaaa.map(ip => `▸ ${ip}`).join("\n") + `\n\n`;
            }
            if (mx.length > 0) {
                reply += `📌 *Mail Servers (MX):*\n` + mx.map(m => `▸ Priority: ${m.priority} | Host: ${m.exchange}`).join("\n") + `\n\n`;
            }
            if (txt.length > 0) {
                reply += `📌 *Text Records (TXT):*\n` + txt.map(t => `▸ ${t.join(" ")}`).join("\n") + `\n\n`;
            }

            await sock.sendMessage(jid, { text: reply.trim() }, { quoted: msg });
        } catch (error) {
            console.error("❌ DNS Lookup Error:", error);
            await sock.sendMessage(jid, { text: `❌ DNS resolution failed for *${host}*.\n\n⚠️ *Reason:* \`${error.message}\`` }, { quoted: msg });
        }
    }
};
