const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function test() {
    try {
        console.log("Testing makeWASocket...");
        const { state } = await useMultiFileAuthState("session");
        const sock = makeWASocket({
            auth: state,
            browser: ["Windows", "Chrome", "110.0.5481.178"],
        });
        console.log("Success! Socket created.");
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
}

test();
