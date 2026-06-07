const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function test() {
    try {
        console.log("Testing useMultiFileAuthState...");
        const { state, saveCreds } = await useMultiFileAuthState("session");
        console.log("Success! state.creds.registered =", state.creds.registered);
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
}

test();
