# 🤖 Nexus-1MD — WhatsApp Bot

> A powerful, multi-feature WhatsApp bot built with **Baileys** and **Node.js** — featuring AI, economy, games, moderation, and 120+ commands.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green)](https://nodejs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue)](LICENSE)
[![Commands](https://img.shields.io/badge/Commands-120+-purple)]()

---

## ✨ Features

| Category | Commands |
|---|---|
| 🧠 **AI Suite** | `!ai`, `!imagine`, `!code`, `!explain` |
| 💰 **Economy/RPG** | `!work`, `!rob`, `!daily`, `!shop`, `!inventory` |
| 🛡️ **Group Moderation** | `!kick`, `!ban`, `!warn`, `!mute`, `!tagall` |
| 🎮 **Games** | `!hangman`, `!trivia`, `!tictactoe`, `!riddle` |
| 📥 **Downloaders** | `!yt`, `!tiktok`, `!instagram`, `!facebook` |
| 🌤️ **Greetings** | `!morning`, `!afternoon`, `!evening` |
| 🔧 **Utilities** | `!weather`, `!translate`, `!wiki`, `!qr` |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js v20+](https://nodejs.org/en/download)
- [Git](https://git-scm.com)
- A WhatsApp account to link

### 1. Clone the Repo
```bash
git clone https://github.com/devwhitewizard/nexus-v1md.git
cd nexus-v1md
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy the example env file and fill in your details:
```bash
cp .env.example .env
```

Edit `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_key_here  # optional
```

> 💡 Get a **free** Groq API key at [console.groq.com](https://console.groq.com)

### 4. Configure the Bot
Edit `config.js` and set your WhatsApp number:
```js
ownerNumbers: ["254712345678@s.whatsapp.net"],
```

### 5. Start the Bot
```bash
npm start
```

Scan the QR code with WhatsApp → **Linked Devices → Link a Device**.

---

## 🖥️ Production Deployment (24/7)

For always-on hosting (VPS/server), use **PM2**:

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot with PM2
pm2 start ecosystem.config.js

# Save and enable auto-start on reboot
pm2 save
pm2 startup
```

### Useful PM2 Commands
```bash
pm2 status          # Check bot status
pm2 logs nexus-bot  # View live logs
pm2 restart nexus-bot  # Restart the bot
pm2 stop nexus-bot  # Stop the bot
```

---

## 📋 Command Prefixes

The bot responds to `!`, `.`, and `/` prefixes.

**Example:** `!ai What is machine learning?` or `.weather Nairobi`

---

## 🔑 API Keys (Optional but Recommended)

| Key | Purpose | Link |
|---|---|---|
| `GROQ_API_KEY` | AI responses (fast, free tier) | [console.groq.com](https://console.groq.com) |
| `OPENAI_API_KEY` | AI fallback | [platform.openai.com](https://platform.openai.com) |

Without API keys, the bot falls back to **Pollinations AI** (free, but may be slower).

---

## 📁 Project Structure

```
nexus-v1md/
├── commands/        # All bot commands (120+ files)
├── lib/             # Core libraries (AI, DB, automation)
├── database/        # SQLite models & settings
├── plugins/         # Plugin loader system
├── session/         # WhatsApp auth session (auto-generated)
├── index.js         # Entry point
├── config.js        # Bot configuration
└── .env             # API keys (never commit this!)
```

---

## ⚠️ Important Notes

- **Never share your `session/` folder** — it contains your WhatsApp credentials.
- **Never commit `.env`** — it contains your API keys.

### Option 2: Deployment with Docker (Recommended)
If you have Docker installed, you can run the bot without worrying about dependencies.

1. **Configure Environment**:
   Update your `.env` file with your API keys.

2. **Launch with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Link WhatsApp**:
   Check the logs to see the QR code:
   ```bash
   docker logs -f nexus-1md
   ```

---

### Phase 4: Customization
- **Change Banner**: Replace `assets/Nexuspic.png` with your own image.
- **Set Name**: Update `config.js` with your bot's name.
The `database/database.db` file stores all economy and user data.

---

## 🛠️ Built With

- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web API
- [Sequelize + SQLite](https://sequelize.org) — Database ORM
- [Groq API](https://groq.com) — AI inference
- [Pollinations AI](https://pollinations.ai) — Free AI fallback

---

## 📄 License

ISC © [devwhitewizard](https://github.com/devwhitewizard)
