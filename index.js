const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const qrcode = require("qrcode-terminal");

const { ownerNumber, authFolder } = require("./config");
const { handleMessages } = require("./lib/commandHandler");

let isFirstConnect = true; 
let isReconnecting = false;

async function connectionLogic() {
    if (isReconnecting) return; // Prevent multiple instances
    isReconnecting = true;

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        markOnline: true, // Try to keep connection alive
        browser: ["Nexus-1MD", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.clear();
            console.log("📲 Scan this QR to login:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            isReconnecting = false;
            console.log("✅ Bot connected and stable!");
            
            if (isFirstConnect) {
                isFirstConnect = false;
                console.log("🚀 Sending initial online notification...");
                await sock.sendMessage(ownerNumber, { text: "🤖 Bot is now online! (v1.0.0)" });
            }
        }

        if (connection === "close") {
            isReconnecting = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            const reason = lastDisconnect?.error?.message || "Unknown error";
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log(`🔌 DISCONNECTED! Code: ${statusCode} | Reason: ${reason}`);
                
                // 🛑 CRITICAL: Do NOT reconnect if it's a conflict
                if (statusCode === 440 || reason.includes("conflict")) {
                    console.error("❌ CRITICAL: CONNECTION CONFLICT. Bot is already running on another device or process.");
                    console.error("💡 FIX: If you have another terminal open, close it. I am stopping this instance to prevent a loop.");
                    process.exit(1); 
                }

                if (!isReconnecting) {
                    isReconnecting = true;
                    const delay = 10000; // Increased to 10s for stability
                    console.log(`⏳ Reconnecting in ${delay/1000}s...`);
                    setTimeout(() => {
                        isReconnecting = false;
                        connectionLogic();
                    }, delay);
                }
            } else {
                console.log("🔌 Connection closed. Not reconnecting.");
            }
        }
    });

    sock.ev.on("messages.upsert", (payload) => handleMessages(sock, payload));
}

connectionLogic();