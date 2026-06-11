<p align="center">
  <img src="assets/nexus-logo.svg" alt="Nexus-1MD Banner" width="100%">
</p>

<p align="center">
  <marquee behavior="alternate" scrollamount="2" width="60%">
    <font color="#00e5ff" size="3"><b>✨ ONLINE ✨</b></font>
  </marquee>
</p>

> **Production-Ready | Binary-Free | Multi-User | Ultra-Stealth | Self-Healing**

Nexus-1MD is a high-performance, enterprise-grade WhatsApp automation framework designed for absolute stability, high security, and premium user experience. Powered by the **Nexus Intelligence Architecture** and built on top of Baileys, it is engineered to run seamlessly on servers, VPS, or local environments without any complex native dependencies.

---

## 🚀 Key Features & Architectural Design

### 🛡️ Secure Identity System
- **Super-Admin (SUDO)**: Complete system-level command capabilities protected with strict identity verification.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Owners, Admins, and regular Users.
- **Stealth Engine**: Human-like emulated presence, custom browser identifiers, and randomized interaction delays to keep your WhatsApp account safe.

### 🩺 Enterprise-Grade Self-Healing Engine
Nexus-1MD is built with a resilient "Zero-Headache" architecture to eliminate manual debugging and connection freezing:
- **Active Connection Watchdog**: Periodically monitors the WebSocket state every 5 minutes, triggering automated restarts for zombie/frozen sockets.
- **Uncaught Exception Shield**: Traps uncaught promise rejections and signal errors to prevent process crashes during delayed history synchronization.
- **Auto-Reset on Logout**: Detects unlinking events (`loggedOut` status code), purges credentials, and restarts the console instance to instantly generate a clean QR code.
- **E2E Decryption-Safe Directory Management**: Prunes only stale metadata while protecting E2E encryption pre-keys, preventing cryptography mismatch errors (`PreKeyError` or `Bad MAC`).
- **Owner Self-Chat Support**: Captures `append` events alongside standard `notify` updates, allowing you to run commands inside your personal chat.
- **Dynamic Session Fallback**: Auto-compresses, base64 encodes, and recovers session files (`creds.json`) directly from environment variables.

---

## 🛠️ Configuration Checklist

To configure Nexus-1MD, duplicate the `.env.example` file, rename it to `.env`, and customize the variables.

| Variable | Description | Mandatory | Default |
| :--- | :--- | :--- | :--- |
| `SUDO` | Primary manager WhatsApp number with country code (e.g., `254797715445`) | **YES** | - |
| `OWNERS` | Comma-separated list of secondary owner numbers | No | - |
| `SESSION_ID` | Base64 gzip-compressed session credentials fallback string | No | - |
| `PAIRING_NUMBER` | Number with country code to request pairing codes instead of QR | No | - |
| `PREFIX` | Command trigger prefix | No | `.` |
| `MODE` | Set bot visibility (`public` or `private`) | No | `public` |
| `DATABASE_URL` | PostgreSQL or custom SQL server connection string | No | SQLite local fallback |
| `GROQ_API_KEY` | GROQ API credential for high-speed AI queries | No | - |
| `OPENAI_API_KEY`| OpenAI developer key for advanced AI features | No | - |

---

## 📂 Command Category Suite

Nexus-1MD has over **165+ production commands** categorized for fast indexing. Type `.menu <category>` to view subcommands directly.

### 👥 Group & Admin Commands
- **Moderation**: `.add`, `.kick`, `.promote`, `.demote`, `.mute`, `.unmute`, `.lock`, `.unlock`
- **Toxicity Guards**: `.antilink`, `.antispam`, `.antibadword` (Automatically warning and kicking offenders)
- **Activity Tracker**: Detailed metrics for inactive group members and tag capabilities (`.tagall`, `.tagadmins`).

### 🤖 AI, Media & Converters
- **Generative AI**: `.ai` (supports GROQ/OpenAI models) and `.imagine` (image generation).
- **Stickers & Media**: Convert any image, video, or GIF into WhatsApp stickers (`.sticker`), change videos to audio (`.toaudio`, `.tomp3`), and convert view-once media (`.viewonce`).
- **Summarization**: Long text/chat logging summary tools (`.summarize`).

### ⛪ Religion Suite
- **Bible (.bible)**: Instantly search bible scriptures or view verses (`.bible John 3:16`, `.bible search faith`).
- **Quran (.quran)**: Retrieve Arabic verses with Sahih translation or search text (`.quran 2:255`, `.quran search patience`).

### 💰 Economy & Interactive Gaming
- **Economy RPG**: Work legally (`.work`), commit crimes (`.crime`), check bank reserves (`.balance`), purchase boosters (`.shop`, `.buy`), or rob other players (`.rob`).
- **Interactive Games**: Host chats with `.trivia`, `.quiz`, `.hangman`, `.tictactoe`, `.mathgame`, `.guess`, or `.wouldyourather`.

### 🛰️ System & Utilities
- **Diagnostic Panel**: `.ping`, `.uptime`, `.systemstatus`, `.botinfo`, `.repo`.
- **API Utilities**: Live weather forecasts (`.weather`), Wikipedia scraper (`.wiki`), inline calculator (`.calc`), translation services (`.translate`), and shortened link generation (`.shortlink`).

---

## 🚀 Quick Start (Deployment)

### System Requirements
- **Node.js**: `v18.x` or higher
- **Package Manager**: `npm`
- **Optional**: `PM2` (for persistent background process management)

### 1. Installation
Clone the repository and install all required modules:
```bash
git clone https://github.com/DevWhiteWizard/Nexus-1MD.git
cd Nexus-1MD
npm install
```

### 2. Environment Configuration
Create your configuration file:
```bash
cp .env.example .env
```
Open `.env` and fill out your `SUDO` manager number. If you prefer pairing code links over QR codes, add your phone number to `PAIRING_NUMBER`.

### 3. Execution
Choose your preferred launch method:

#### Development (Auto-Reload on Code Change)
```bash
npm run dev
```

#### Production (Standard Server)
```bash
npm start
```

#### PM2 Background Manager (Highly Recommended)
```bash
npm run pm2
npm run logs
```

<details>
<summary><b>🚀 Deploy on Render.com (Collapsible Setup Guide)</b></summary>

### 1. Push to GitHub
Fork or push this repository to your own GitHub account.

### 2. Create a Web Service
- Go to [Render.com](https://render.com) and sign in.
- Click **New +** and select **Web Service**.
- Connect your GitHub repository.

### 3. Build & Start Settings
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Set Environment Variables
In the **Environment** settings tab, add the following variables:
- `SESSION_ID`: The base64 gzip-compressed session credentials string (e.g. `NEXUS~...`) generated in your local console when you ran the bot and logged in.
- `PORT`: Set to `10000` (Render's default web service port).
- `SUDO`: Your primary WhatsApp manager number (e.g., `254797715445`).

### 5. Keep Alive (Prevent Sleep)
Render's Free Tier spins down web services if there is no inbound traffic for 15 minutes.
- Copy your Render Web Service URL (e.g., `https://your-bot.onrender.com`).
- Add it to a free uptime monitor service (like **UptimeRobot**, **Better Stack**, or **cron-job.org**) to ping the URL every 5 to 10 minutes. This hits the bot's internal heartbeat server (`app.get("/")`) and keeps the process online 24/7!
</details>

---

## 📜 License & Credits
Developed by **DevWhiteWizard**.  
Powered by the **Nexus Intelligence Architecture**.

*Nexus-1MD is meant for educational, backup, and group administrative tasks. Please respect WhatsApp's Terms of Service.*
