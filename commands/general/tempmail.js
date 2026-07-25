const axios = require("axios");

module.exports = {
    name: "tempmail",
    aliases: ["tempemail", "genmail"],
    description: "Generate a temporary disposable email address",
    category: "general",
    execute: async (ctx) => {
        const { sock, jid, sender, msg } = ctx;

        try {
            await sock.sendMessage(jid, { text: "⏳ Generating temporary email..." }, { quoted: msg });
            const response = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1");
            const email = response.data?.[0];

            if (!email) {
                return await sock.sendMessage(jid, { text: "❌ Failed to generate email. Please try again." }, { quoted: msg });
            }

            global.tempMails = global.tempMails || {};
            global.tempMails[sender] = email;

            let reply = `📬 *TEMPORARY EMAIL GENERATED*\n\n`;
            reply += `📧 *Email Address:* \`${email}\`\n\n`;
            reply += `ℹ️ _Use \`.mailinbox\` to check messages for this email address._`;

            await sock.sendMessage(jid, { text: reply }, { quoted: msg });
        } catch (error) {
            console.error("❌ TempMail Error:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to generate temporary email. API might be offline." }, { quoted: msg });
        }
    }
};
