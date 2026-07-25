module.exports = {
    name: "repeat",
    aliases: ["spammsg", "echo"],
    description: "Repeats a message multiple times (Safe mode).",
    category: "general",
    async execute({ sock, jid, args, msg }) {
        const fullArgs = args.join(" ");
        if (!fullArgs.includes(",")) {
            return await sock.sendMessage(jid, { 
                text: "✳️ *Usage:* `.repeat count,message`\nExample: `.repeat 10,I love you`" 
            }, { quoted: msg });
        }

        const [countStr, ...textArr] = fullArgs.split(",");
        const count = parseInt(countStr.trim());
        const text = textArr.join(",").trim();

        if (isNaN(count) || count <= 0) {
            return await sock.sendMessage(jid, { text: "❌ *Error:* Repetition count must be a valid number greater than 0." });
        }

        if (count > 50) {
            return await sock.sendMessage(jid, { text: "⚠️ *Safety Limit:* For your account's protection, I can only repeat a message up to 50 times in one go." });
        }

        if (!text) {
            return await sock.sendMessage(jid, { text: "❌ *Error:* Please provide the text you want to repeat." });
        }

        let repeatedText = "";
        for (let i = 0; i < count; i++) {
            repeatedText += `${text}\n`;
        }

        await sock.sendMessage(jid, { text: repeatedText.trim() }, { quoted: msg });
    }
};
