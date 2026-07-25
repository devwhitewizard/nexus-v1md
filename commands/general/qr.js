const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
    name: "qr",
    aliases: ["qrcode", "genqr", "makeqr"],
    description: "Generate a QR code from text or a URL.",
    category: "general",
    execute: async ({ sock, jid, args, msg }) => {
        const text = args.join(" ").trim();
        if (!text) {
            return await sock.sendMessage(jid, {
                text:
                    "❓ *Usage:* `.qr <text or URL>`\n\n" +
                    "*Examples:*\n" +
                    "• `.qr https://example.com`\n" +
                    "• `.qr Hello World`\n" +
                    "• `.qr +254700000000`"
            });
        }

        const tmpPath = path.join(os.tmpdir(), `nexus_qr_${Date.now()}.png`);

        try {
            await sock.sendMessage(jid, { text: "⏳ Generating QR code..." });

            await QRCode.toFile(tmpPath, text, {
                type: "png",
                width: 512,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF"
                }
            });

            const imageBuffer = fs.readFileSync(tmpPath);

            await sock.sendMessage(jid, {
                image: imageBuffer,
                caption:
                    `📱 *QR CODE GENERATED*\n\n` +
                    `📝 *Content:* ${text.length > 60 ? text.slice(0, 60) + "..." : text}\n\n` +
                    `_Scan with any QR reader • Nexus-1MD_`
            }, { quoted: msg });

        } catch (err) {
            console.error("QR generation error:", err);
            await sock.sendMessage(jid, { text: "❌ Failed to generate QR code. Please try again." });
        } finally {
            // Clean up temp file
            if (fs.existsSync(tmpPath)) {
                try { fs.unlinkSync(tmpPath); } catch (_) {}
            }
        }
    }
};


// 📲 Web QR Login Helper (Exposed on global.app if available to keep index.js clean)
if (global.app) {
    const app = global.app;
    const QRCode = require("qrcode");

    app.get("/qr", async (req, res) => {
        const isConnected = !!(global.sock && global.sock.user);

        if (isConnected) {
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nexus-1MD - Connected</title>
                    <style>
                        body {
                            background: radial-gradient(circle at center, #111e15 0%, #070b08 100%);
                            color: #ffffff;
                            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            overflow: hidden;
                        }
                        .card {
                            background: rgba(18, 30, 22, 0.4);
                            backdrop-filter: blur(16px);
                            border: 1px solid rgba(0, 230, 118, 0.2);
                            padding: 40px;
                            border-radius: 20px;
                            text-align: center;
                            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                            max-width: 400px;
                            width: 90%;
                            animation: fadeInUp 0.8s ease-out;
                        }
                        .icon {
                            font-size: 64px;
                            color: #00e676;
                            margin-bottom: 20px;
                            filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));
                            animation: pulse 2s infinite alternate;
                        }
                        h2 {
                            margin: 0 0 10px 0;
                            font-size: 28px;
                            font-weight: 700;
                            color: #00e676;
                            letter-spacing: 0.5px;
                        }
                        p {
                            color: #a0aec0;
                            font-size: 15px;
                            line-height: 1.6;
                            margin: 0 0 20px 0;
                        }
                        .btn {
                            background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%);
                            color: #070b08;
                            border: none;
                            padding: 12px 28px;
                            font-size: 15px;
                            font-weight: 600;
                            border-radius: 30px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(0, 230, 118, 0.3);
                            text-decoration: none;
                            display: inline-block;
                        }
                        .btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(0, 230, 118, 0.5);
                        }
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            100% { transform: scale(1.05); }
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">⚡</div>
                        <h2>Bot Connected</h2>
                        <p>Nexus-1MD is authenticated and running smoothly on WhatsApp!</p>
                        <a href="/" class="btn">Check Bot Health</a>
                    </div>
                </body>
                </html>
            `);
        }

        if (!global.latestQr) {
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nexus-1MD - Connecting</title>
                    <style>
                        body {
                            background: radial-gradient(circle at center, #1a202c 0%, #0f172a 100%);
                            color: #ffffff;
                            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .card {
                            background: rgba(30, 41, 59, 0.4);
                            backdrop-filter: blur(16px);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            padding: 40px;
                            border-radius: 20px;
                            text-align: center;
                            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                            max-width: 400px;
                            width: 90%;
                        }
                        .spinner {
                            border: 4px solid rgba(255, 255, 255, 0.1);
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border-left-color: #00e676;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 20px auto;
                        }
                        h2 {
                            margin: 0 0 10px 0;
                            font-size: 24px;
                            color: #e2e8f0;
                        }
                        p {
                            color: #94a3b8;
                            font-size: 14px;
                            margin: 0;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                    <script>
                        setTimeout(() => window.location.reload(), 3000);
                    </script>
                </head>
                <body>
                    <div class="card">
                        <div class="spinner"></div>
                        <h2>Initializing Session</h2>
                        <p>Waiting for connection state. This page will refresh automatically...</p>
                    </div>
                </body>
                </html>
            `);
        }

        try {
            const qrImage = await QRCode.toDataURL(global.latestQr);
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nexus-1MD - WhatsApp QR Login</title>
                    <style>
                        body {
                            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
                            color: #ffffff;
                            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            overflow: hidden;
                        }
                        .container {
                            background: rgba(30, 41, 59, 0.4);
                            backdrop-filter: blur(16px);
                            border: 1px solid rgba(0, 230, 118, 0.25);
                            padding: 40px;
                            border-radius: 24px;
                            text-align: center;
                            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
                            max-width: 450px;
                            width: 90%;
                            animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        h2 {
                            margin: 0 0 8px 0;
                            font-size: 26px;
                            font-weight: 700;
                            color: #00e676;
                            letter-spacing: 0.5px;
                        }
                        p {
                            color: #94a3b8;
                            font-size: 14px;
                            margin: 0 0 25px 0;
                            line-height: 1.5;
                        }
                        .qr-wrapper {
                            background: #ffffff;
                            padding: 16px;
                            border-radius: 16px;
                            display: inline-block;
                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                            margin-bottom: 25px;
                            transition: transform 0.3s ease;
                        }
                        .qr-wrapper:hover {
                            transform: scale(1.02);
                        }
                        img {
                            display: block;
                            width: 250px;
                            height: 250px;
                        }
                        .instruction {
                            font-size: 13px;
                            color: #64748b;
                            background: rgba(15, 23, 42, 0.6);
                            padding: 10px 16px;
                            border-radius: 30px;
                            border: 1px solid rgba(255, 255, 255, 0.05);
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .dot {
                            width: 8px;
                            height: 8px;
                            background-color: #00e676;
                            border-radius: 50%;
                            animation: blink 1.5s infinite;
                        }
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(30px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes blink {
                            0%, 100% { opacity: 0.3; }
                            50% { opacity: 1; }
                        }
                    </style>
                    <script>
                        setInterval(async () => {
                            try {
                                const res = await fetch('/api/connection-status');
                                const data = await res.json();
                                if (data.connected || data.qr !== "${global.latestQr}") {
                                    window.location.reload();
                                }
                            } catch (e) {}
                        }, 5000);
                    </script>
                </head>
                <body>
                    <div class="container">
                        <h2>Link Nexus-1MD</h2>
                        <p>Scan this QR code with WhatsApp Link Device on your phone to link your bot instance.</p>
                        <div class="qr-wrapper">
                            <img src="${qrImage}" alt="WhatsApp QR Code" />
                        </div>
                        <br/>
                        <div class="instruction">
                            <span class="dot"></span>
                            <span>Waiting for scan... Refreshes automatically</span>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } catch (err) {
            res.status(500).send("Error generating QR code page.");
        }
    });

    app.get("/api/connection-status", (req, res) => {
        res.json({
            connected: !!(global.sock && global.sock.user),
            qr: global.latestQr || null
        });
    });
}

