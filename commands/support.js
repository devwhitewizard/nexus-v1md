const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = {
    name: "support",
    aliases: ["groupchat", "community", "whatsapp", "contact", "admins"],
    description: "Get contact links for the bot owners and the testing group.",
    category: "general",
    execute: async ({ sock, jid, msg }) => {
        const owners = config.ownerNumbers || [];
        let contactText = `💬 *NEXUS-1MD SUPPORT & COMMUNITY*\n\n` +
                          `👥 *Official Testing & Support Group:*\n` +
                          `Join the group to test bot functionality, chat, and get updates:\n` +
                          `👉 https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe\n\n` +
                          `🛡️ *Bot Administrators:*\n` +
                          `For private support or queries, contact the admin team:\n\n`;

        if (owners.length > 0) {
            owners.forEach((ownerJid, idx) => {
                const number = ownerJid.split("@")[0];
                const role = idx === 0 ? "Primary Owner (SUDO)" : "Administrator";
                contactText += `👤 *${role}:*\n` +
                               `👉 https://wa.me/${number}\n\n`;
            });
        } else {
            contactText += `⚠️ No administrators configured.\n\n`;
        }

        contactText += `_Thank you for using Nexus-1MD!_`;

        const { getSettings } = require("../lib/settings");
        const settings = getSettings();
        const botImageUrl = settings.botImage;

        try {
            let banner;
            if (botImageUrl && botImageUrl.startsWith("http")) {
                banner = { url: botImageUrl };
            } else {
                banner = fs.readFileSync(path.join(__dirname, "../assets/Nexuspic.jpg"));
            }
            await sock.sendMessage(jid, { 
                image: banner,
                caption: contactText
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(jid, { text: contactText }, { quoted: msg });
        }
    }
};
