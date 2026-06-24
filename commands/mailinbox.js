const axios = require("axios");

module.exports = {
    name: "mailinbox",
    aliases: ["checkmail", "inbox"],
    description: "Check inbox messages for your temporary email",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, args, sender, msg } = ctx;

        global.tempMails = global.tempMails || {};
        const email = global.tempMails[sender];

        if (!email) {
            return await sock.sendMessage(jid, { text: "⚠️ You have not generated a temporary email address yet. Use `.tempmail` first." }, { quoted: msg });
        }

        const [login, domain] = email.split("@");
        const msgId = args[0];

        try {
            if (msgId) {
                // Read specific message
                await sock.sendMessage(jid, { text: `⏳ Fetching email ID \`${msgId}\`...` }, { quoted: msg });
                const res = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${msgId}`);
                const data = res.data;

                if (!data || !data.from) {
                    return await sock.sendMessage(jid, { text: "❌ Email message not found or could not be loaded." }, { quoted: msg });
                }

                let reply = `✉️ *EMAIL MESSAGE DETAIL*\n\n`;
                reply += `👤 *From:* ${data.from}\n`;
                reply += `🏷️ *Subject:* ${data.subject || "(No Subject)"}\n`;
                reply += `📅 *Date:* ${data.date}\n\n`;
                reply += `💬 *Message:*\n${data.textBody || data.body || "(Empty message body)"}\n`;

                return await sock.sendMessage(jid, { text: reply }, { quoted: msg });
            } else {
                // List inbox
                await sock.sendMessage(jid, { text: `⏳ Checking inbox for \`${email}\`...` }, { quoted: msg });
                const res = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
                const list = res.data;

                if (!list || list.length === 0) {
                    return await sock.sendMessage(jid, { text: `📥 Inbox is currently empty for \`${email}\`.` }, { quoted: msg });
                }

                let reply = `📬 *INBOX FOR* \`${email}\`\n`;
                reply += `_Total messages: ${list.length}_\n\n`;
                reply += `_Reply with \`.mailinbox <ID>\` to read any specific email:_\n\n`;

                list.forEach((m, idx) => {
                    reply += `*${idx + 1}.* ID: \`${m.id}\`\n`;
                    reply += `▸ *From:* ${m.from}\n`;
                    reply += `▸ *Subject:* ${m.subject || "(No Subject)"}\n`;
                    reply += `▸ *Date:* ${m.date}\n\n`;
                });

                await sock.sendMessage(jid, { text: reply }, { quoted: msg });
            }
        } catch (error) {
            console.error("❌ MailInbox Error:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to fetch emails. Please try again later." }, { quoted: msg });
        }
    }
};
