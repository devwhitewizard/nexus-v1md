module.exports = {
    name: "boturl",
    aliases: ["setbio", "setstatus", "setboturl"],
    description: "Update the About/bio section of the bot",
    category: "owner",
    isOwnerOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;
        const text = args.join(" ");

        if (!text) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: `.boturl <bio text>`" }, { quoted: msg });
        }

        try {
            await sock.updateProfileStatus(text);
            await sock.sendMessage(jid, { text: `✅ Bot bio/status updated to:\n\n_"${text}"_` }, { quoted: msg });
        } catch (err) {
            console.error("About status update error:", err);
            await sock.sendMessage(jid, { text: `❌ Failed to update bio/status: ${err.message}` }, { quoted: msg });
        }
    }
};
