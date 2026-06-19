# 🛡️ Galaxi Auto Moderator

Bot moderasi otomatis untuk Discord yang canggih — dirancang untuk menjaga ketertiban komunitas.

## ✨ Fitur Utama

### 🤖 Auto Moderasi Otomatis
- **Anti-Toxic** — Mendeteksi kata kasar/toxic dalam Bahasa Indonesia & Inggris secara akurat
- **Anti-Phishing** — Mendeteksi link phishing/scam Discord Nitro palsu, Steam palsu, dll
- **Anti-Spam** — Mendeteksi flood pesan, duplikat pesan, dan spam tag/mention
- **Auto-Hukuman** — Otomatis timeout → kick → ban berdasarkan akumulasi peringatan

### 💬 Perintah Chat
- Ketik `bot` atau `status bot` → Bot menampilkan daftar semua bot aktif di server beserta status, ping, dan uptime

### ⚙️ Slash Commands
| Perintah | Deskripsi | Permission |
|----------|-----------|------------|
| `/warn` | Beri peringatan ke member | Moderate Members |
| `/warnings list/clear/remove` | Kelola peringatan | Moderate Members |
| `/kick` | Kick member | Kick Members |
| `/ban` | Ban member | Ban Members |
| `/timeout` | Timeout member sementara | Moderate Members |
| `/purge` | Hapus banyak pesan | Manage Messages |
| `/userinfo` | Info + riwayat moderasi member | Semua |
| `/setup` | Konfigurasi bot (log channel, dll) | Administrator |
| `/help` | Tampilkan bantuan | Semua |

### 📋 Sistem Hukuman Otomatis
| Pelanggaran | Tindakan |
|-------------|----------|
| Toxic / Phishing | Hapus pesan + Timeout + Warn |
| Spam flood | Hapus pesan + Timeout 5 menit |
| 3x Peringatan (default) | Auto Kick |
| 5x Peringatan (default) | Auto Ban permanen |

## 🚀 Setup

### 1. Buat Discord Bot
1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
2. Buat aplikasi baru → Tab "Bot" → Aktifkan semua **Privileged Gateway Intents**:
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
   - `PRESENCE INTENT`
3. Copy token bot

### 2. Invite Bot ke Server
Gunakan link ini (ganti `CLIENT_ID` dengan ID bot kamu):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 3. Setup Lokal
```bash
git clone https://github.com/Tenuh-dev/Galaxi-Moderator.git
cd Galaxi-Moderator
npm install
cp .env.example .env
# Edit .env, isi DISCORD_BOT_TOKEN
npm run build
npm start
```

### 4. Konfigurasi di Discord
Setelah bot online, gunakan perintah:
```
/setup logchannel #channel-log
/setup maxwarns kick:3 ban:5
```

## 🌐 Deploy ke Wasmer

### Syarat
- Akun [Wasmer](https://wasmer.io)
- Wasmer CLI terinstall

### Langkah Deploy
```bash
# Install Wasmer CLI
curl https://get.wasmer.io -sSfL | sh

# Login
wasmer login

# Deploy
wasmer deploy
```

### Deploy via GitHub Actions
1. Di repo GitHub, buka **Settings → Secrets and variables → Actions**
2. Tambahkan secrets:
   - `DISCORD_BOT_TOKEN` — Token bot Discord kamu
   - `WASMER_TOKEN` — Token dari [wasmer.io/settings/access-tokens](https://wasmer.io/settings/access-tokens)
3. Push ke branch `main` → Deploy otomatis!

## ⚙️ Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `DISCORD_BOT_TOKEN` | Token bot Discord | **Wajib** |
| `LOG_CHANNEL_ID` | ID channel log (opsional, bisa via /setup) | - |
| `MAX_WARNS_BEFORE_KICK` | Peringatan sebelum kick | 3 |
| `MAX_WARNS_BEFORE_BAN` | Peringatan sebelum ban | 5 |
| `SPAM_THRESHOLD` | Batas pesan spam | 5 |
| `SPAM_INTERVAL_MS` | Interval spam check (ms) | 5000 |
| `MAX_MENTIONS` | Batas mention per pesan | 5 |

## 📁 Struktur Project
```
galaxi-moderator/
├── src/
│   ├── commands/       # Slash commands
│   ├── events/         # Discord events
│   ├── handlers/       # Auto-mod logic
│   ├── utils/          # Database, logger, patterns
│   ├── types/          # TypeScript types
│   ├── config/         # Konfigurasi
│   └── index.ts        # Entry point
├── dist/               # Build output (TypeScript compiled)
├── data/               # Database SQLite (auto-created)
├── wasmer.toml         # Wasmer deployment config
└── .github/workflows/  # CI/CD GitHub Actions
```

## 📝 Lisensi
MIT License — bebas digunakan dan dimodifikasi.
