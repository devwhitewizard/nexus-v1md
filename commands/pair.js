const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const pino = require("pino");

module.exports = {
    name: "pair",
    description: "Generate a Session ID for another number using pairing code.",
    category: "system",
    usage: "pair <number>",
    execute: async ({ sock, jid, args, msg }) => {
        if (!args[0]) return await sock.sendMessage(jid, { text: "❌ Please provide a phone number with country code.\nExample: `.pair 254797715445`" });

        const targetNumber = args[0].replace(/[^0-9]/g, "");
        if (targetNumber.length < 10) return await sock.sendMessage(jid, { text: "❌ Invalid phone number format." });

        const pairingId = `pair_${Date.now()}`;
        const tempSessionDir = path.join(__dirname, "../tmp", pairingId);
        
        await sock.sendMessage(jid, { text: "⏳ *Generating Pairing Code...* Please wait." });

        try {
            const { state, saveCreds } = await useMultiFileAuthState(tempSessionDir);
            
            const pairSock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["Nexus-1MD", "Chrome", "1.0.0"]
            });

            // 1. Request the code
            setTimeout(async () => {
                try {
                    const code = await pairSock.requestPairingCode(targetNumber);
                    
                    await sock.sendMessage(jid, { 
                        text: `🔗 *NEXUS-1MD PAIRING*\n\nEnter the code below on your phone:`
                    }, { quoted: msg });

                    // Send code as separate message for 1-tap copy
                    await sock.sendMessage(jid, { text: code });

                    await sock.sendMessage(jid, { 
                        text: `1. Open WhatsApp > Linked Devices.\n2. Tap 'Link with phone number instead'.\n3. Paste the code above.`
                    });
                } catch (e) {
                    console.error("Pairing Request Error:", e);
                }
            }, 3000);

            // 2. Monitor for connection
            pairSock.ev.on("creds.update", saveCreds);
            pairSock.ev.on("connection.update", async (update) => {
                const { connection } = update;
                
                if (connection === "open") {
                    const credsPath = path.join(tempSessionDir, "creds.json");
                    const credsData = fs.readFileSync(credsPath, "utf-8");
                    const sessionId = "Nexus~" + Buffer.from(credsData).toString("base64");

                    await sock.sendMessage(jid, { 
                        text: `✅ *Session Generated!*\nCopy the code below:`
                    });

                    // Send ID as separate message for 1-tap copy
                    await sock.sendMessage(jid, { text: sessionId });

                    await sock.sendMessage(jid, { 
                        text: `💎 *How to use:* \n1. Copy the code above.\n2. Paste it as \`SESSION_ID\` in your Render/Heroku environment variables.`
                    });

                    // Cleanup
                    pairSock.ev.removeAllListeners();
                    setTimeout(() => {
                        fs.rmSync(tempSessionDir, { recursive: true, force: true });
                    }, 5000);
                }
            });

            // 3. Auto-timeout after 5 minutes
            setTimeout(() => {
                try {
                    pairSock.end();
                    if (fs.existsSync(tempSessionDir)) {
                        fs.rmSync(tempSessionDir, { recursive: true, force: true });
                    }
                } catch (e) {}
            }, 300000);

        } catch (err) {
            console.error("Critical Pairing Error:", err);
            await sock.sendMessage(jid, { text: "❌ Internal error occurred during pairing setup." });
        }
    }
};
