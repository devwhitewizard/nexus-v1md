module.exports = {
    name: "calc",
    aliases: ["calculate", "math", "eval"],
    description: "Safely evaluate a mathematical expression.",
    category: "general",
    execute: async ({ sock, jid, args, msg }) => {
        const expression = args.join(" ").trim();
        if (!expression) {
            return await sock.sendMessage(jid, {
                text: "❓ *Usage:* `.calc <expression>`\n\n_Examples:_\n• `.calc 2 + 2`\n• `.calc (5 * 8) / 2`\n• `.calc 3^4`\n• `.calc sqrt(144)`"
            });
        }

        try {
            // Safe math evaluator — only allows digits, operators, parentheses, and math functions
            const sanitized = expression
                .replace(/\^/g, "**")            // Handle caret exponentiation
                .replace(/sqrt\(/g, "Math.sqrt(")
                .replace(/abs\(/g, "Math.abs(")
                .replace(/ceil\(/g, "Math.ceil(")
                .replace(/floor\(/g, "Math.floor(")
                .replace(/round\(/g, "Math.round(")
                .replace(/log\(/g, "Math.log10(")
                .replace(/ln\(/g, "Math.log(")
                .replace(/sin\(/g, "Math.sin(")
                .replace(/cos\(/g, "Math.cos(")
                .replace(/tan\(/g, "Math.tan(")
                .replace(/pi/gi, "Math.PI")
                .replace(/e(?![a-zA-Z0-9_])/g, "Math.E");

            // Whitelist check — reject any expression that still has dangerous characters
            if (/[a-zA-Z_$]/.test(sanitized.replace(/Math\./g, ""))) {
                return await sock.sendMessage(jid, { text: "❌ Invalid expression. Only math operations are allowed." });
            }

            // eslint-disable-next-line no-new-func
            const result = Function(`"use strict"; return (${sanitized})`)();

            if (typeof result !== "number" || !isFinite(result)) {
                return await sock.sendMessage(jid, { text: "❌ Result is undefined or infinite. Check your expression." });
            }

            // Format nicely — trim excessive decimals
            const formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString();

            const reply =
                `🧮 *CALCULATOR*\n\n` +
                `📝 *Expression:* \`${expression}\`\n` +
                `✅ *Result:* \`${formatted}\`\n\n` +
                `_Nexus-1MD Math Engine_`;

            await sock.sendMessage(jid, { text: reply }, { quoted: msg });
        } catch (err) {
            console.error("Calc error:", err);
            await sock.sendMessage(jid, { text: `❌ Could not evaluate: \`${expression}\`\n\nCheck for syntax errors and try again.` });
        }
    }
};
