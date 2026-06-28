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
        let contactText = `💬 *NEXUS-MD SUPPORT & COMMUNITY*\n\n` +
                          `👥 *Official Testing & Support Group:*\n` +
                          `Join the group to test bot functionality, chat, and get updates:\n` +
                          `👉 https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe\n\n` +
                          `📢 *Official WhatsApp Channel:*\n` +
                          `Follow the channel for bot updates and announcements:\n` +
                          `👉 https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02\n\n` +
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

        contactText += `_Thank you for using Nexus-MD!_`;

        const { getSettings } = require("../lib/settings");
        const settings = getSettings();
        const botImageUrl = settings.botImage;

        let banner;
        if (botImageUrl && botImageUrl.startsWith("http")) {
            banner = { url: botImageUrl };
        } else {
            const bannerPath = path.join(__dirname, "../assets/Nexuspic.jpg");
            banner = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null;
        }

        const { sendButtonMessage } = require("../lib/utils");
        const footerText = "Nexus-MD Support";
        const buttons = [
            { text: "💻 Bot Repo", url: "https://github.com/devwhitewizard/nexus-v1md" },
            { text: "📢 WhatsApp Channel", url: "https://whatsapp.com/channel/0029VbD62UY7IUYU6cftzu02" }
        ];

        await sendButtonMessage(sock, jid, contactText, footerText, buttons, banner, msg);
    }
};
