<p align="center">
  <img src="assets/nexus-logo.svg" alt="Nexus-1MD Banner" width="100%">
</p>

<p align="center">
  <marquee behavior="alternate" scrollamount="2" width="60%">
    <font color="#00e5ff" size="3"><b>✨ ONLINE ✨</b></font>
  </marquee>
</p>

---

## ℹ️ About Nexus-1MD

Nexus-1MD is a lightweight, customizable WhatsApp automation and userbot utility built on top of the `@whiskeysockets/baileys` library. It enables single or multi-user interaction with automated moderation, utility search commands, funny filters, media converters, and AI assistants. It is optimized to run efficiently on low-resource environments (like VPS or Render Free tier) without memory leaks or CPU crashes.

---

## 👥 Join Our Community & Show Your Support

### 💬 Official WhatsApp Group
Stay updated, ask questions, and chat with other users by joining our official group:
👉 **[Join Nexus-1MD Support Group](https://chat.whatsapp.com/CSPKnrOIG52LdMO06pZgNe)**

### ⭐ Support the Project
If you like Nexus-1MD, please take a moment to support the repository:
- **Star the Repo**: Click the ⭐ button at the top right of this page to show your love!
- **Fork the Repo**: Click the 🍴 Fork button to clone it into your own account and customize it.

---

## 📂 Command Categories

Nexus-1MD features a comprehensive suite of commands grouped into clear categories. You can type `.menu <category>` in WhatsApp to see all available commands.

*   **Group & Admin**: Tools to manage group chats.
    *   *Examples*: `.kick @user`, `.mute`
*   **Toxicity Guards**: Automated safety protection filters.
    *   *Examples*: `.antilink` (auto-delete link shares), `.antispam` (stop flood messages)
*   **AI & Media Utilities**: Intelligent queries and media conversion.
    *   *Examples*: `.ai` (query GROQ/OpenAI models), `.sticker` (convert image/video to WhatsApp sticker)
*   **Religion Suite**: Search and retrieve scriptures.
    *   *Examples*: `.bible John 3:16`, `.quran 2:255`
*   **Economy & Games**: Chat-based RPG elements and interactive mini-games.
    *   *Examples*: `.work` (earn currency), `.trivia` (play a quiz game)
*   **Display Picture (DP) Suite**: Fetch, process, and overlay fun designs on user profile pictures.
    *   *Examples*: `.dp @user`, `.wanteddp @user` (create a wanted poster overlay)
*   **System & General Tools**: Diagnostics and live query utilities.
    *   *Examples*: `.ping`, `.weather Nairobi`

---

## 🛠️ Configuration Checklist

To configure Nexus-1MD, duplicate the `.env.example` file, rename it to `.env`, and customize the variables.

| Variable | Description | Mandatory | Default |
| :--- | :--- | :--- | :--- |
| `SUDO` | Primary manager WhatsApp number with country code (e.g., `254712345678`) | **YES** | - |
| `OWNERS` | Comma-separated list of secondary owner numbers | No | - |
| `SESSION_ID` | Base64 gzip-compressed session credentials fallback string | No | - |
| `PAIRING_NUMBER` | Number with country code to request pairing codes instead of QR | No | - |
| `PREFIX` | Command trigger prefix | No | `.` |
| `MODE` | Set bot visibility (`public` or `private`) | No | `public` |
| `DATABASE_URL` | PostgreSQL or custom SQL server connection string | No | SQLite local fallback |
| `GROQ_API_KEY` | GROQ API credential for high-speed AI queries | No | - |
| `OPENAI_API_KEY`| OpenAI developer key for advanced AI features | No | - |

---

## 🚀 Steps to Deploy

### Local / VPS Installation

Ensure you have [Node.js](https://nodejs.org/) v18+ installed on your system.

1. **Clone the Repository**
   ```bash
   git clone https://github.com/devwhitewizard/nexus-v1md.git
   cd Nexus-1MD
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env` and fill in the required variables (specifically `SUDO`):
   ```bash
   cp .env.example .env
   ```

4. **Run the Bot**
   Choose your run command:
   - For development: `npm run dev`
   - For normal production: `npm start`
   - For PM2 (background runner): `npm run pm2`

---

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
- `SUDO`: Your primary WhatsApp manager number (e.g., `254712345678`).

### 5. Keep Alive (Prevent Sleep)
Render's Free Tier spins down web services if there is no inbound traffic for 15 minutes.
- Copy your Render Web Service URL (e.g., `https://your-bot.onrender.com`).
- Add it to a free uptime monitor service (like **UptimeRobot**, **Better Stack**, or **cron-job.org**) to ping the URL every 5 to 10 minutes. This hits the bot's internal heartbeat server (`app.get("/")`) and keeps the process online 24/7!
</details>

---

## ⚠️ Warning

This bot is NOT officially authorized, endorsed, or affiliated with WhatsApp Inc. or Meta Platforms, Inc. Self-bots, userbots, and automation tools violate WhatsApp's Terms of Service. Using this bot carries a risk of permanent account suspension or ban. Use this bot responsibly, avoid spamming, and run it at your own risk.

## ⚖️ Legal & Disclaimer

The developers of Nexus-1MD are not responsible for any damage, account bans, data loss, or legal actions resulting from the use of this software. By deploying or using this code, you agree to take full responsibility for your actions and abide by local regulations and terms of service.

## 🔏 Copyright

Copyright © 2026 DevWhiteWizard. All rights reserved.

This repository and its source code are the intellectual property of the author and contributors. You are permitted to fork, modify, and run the software for personal, non-commercial use, provided the original credits remain intact.

## 📄 License

This project is licensed under the **ISC License**. For more information, please refer to the `package.json` file.

## 🏅 Credits

- **DevWhiteWizard** - Creator & Lead Developer.
- **Baileys Library** - Excellent WhatsApp Web API library (`@whiskeysockets/baileys`).
- All open-source package authors whose modules are used in this project.
