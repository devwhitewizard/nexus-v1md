const { generateImage } = require("../../lib/aiHelper");

module.exports = {
    name: "imagine",
    aliases: ["img", "draw", "generate", "genimage"],
    description: "Generate an AI image from a text prompt.",
    category: "ai",
    execute: async ({ sock, jid, args, msg }) => {
        const prompt = args.join(" ").trim();
        if (!prompt) {
            return await sock.sendMessage(jid, {
                text:
                    "🎨 *Usage:* `.imagine <description>`\n\n" +
                    "*Examples:*\n" +
                    "• `.imagine a sunset over the ocean`\n" +
                    "• `.imagine a futuristic city at night`\n" +
                    "• `.imagine a cute cat wearing a hat`"
            });
        }

        try {
            await sock.sendMessage(jid, { react: { text: "🎨", key: msg.key } });
            await sock.sendMessage(jid, { text: `🎨 Generating image for: _"${prompt}"_\n\n⏳ Please wait...` });

            const imageBuffer = await generateImage(prompt);

            await sock.sendMessage(jid, {
                image: imageBuffer,
                caption:
                    `🎨 *AI IMAGE GENERATED*\n\n` +
                    `📝 *Prompt:* ${prompt.length > 80 ? prompt.slice(0, 80) + "..." : prompt}\n\n` +
                    `_Powered by Pollinations AI • Nexus-1MD_`
            }, { quoted: msg });

        } catch (err) {
            console.error("Imagine error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to generate image. Try a different prompt or try again later." });
        }
    }
};
