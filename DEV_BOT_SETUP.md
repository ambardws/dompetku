# 🤖 Dev Incident Bot — Setup Guide

Bot Telegram **khusus developer** yang mengirim alert otomatis saat CI/CD pipeline gagal.
Ini **berbeda** dari bot Dompetku yang digunakan user app.

---

## Arsitektur

```
GitHub Actions (CI gagal)
    ↓
incident-response.yml
    ↓
scripts/incident-agent.mjs  ← analisa root cause
    ↓
Telegram Dev Bot  →  Chat developer / grup dev
```

---

## Step 1: Buat Bot Baru via BotFather

1. Buka Telegram → cari **@BotFather**
2. Ketik `/newbot`
3. Isi nama bot: `Dompetku CI Bot` (atau bebas)
4. Isi username: `dompetkuci_bot` (harus diakhiri `_bot`)
5. Copy token yang muncul → ini adalah `TELEGRAM_DEV_BOT_TOKEN`

---

## Step 2: Dapatkan Chat ID Kamu

1. Buka Telegram → cari **@userinfobot**
2. Ketik `/start`
3. Bot akan balas dengan info termasuk **Id** → ini `TELEGRAM_DEV_CHAT_ID`

> **Tip:** Bisa juga pakai Group Chat ID agar seluruh tim dev menerima notif.
> Tambahkan bot ke group dulu, lalu cek ID group via @userinfobot.

---

## Step 3: Set Environment Variables

### Lokal (untuk test)
Edit `.env`:
```bash
TELEGRAM_DEV_BOT_TOKEN=1234567890:AABBCCDDEEFFaabbccddeeff...
TELEGRAM_DEV_CHAT_ID=987654321
```

### GitHub Actions (untuk CI/CD)
1. Buka repository GitHub → **Settings**
2. **Secrets and variables** → **Actions**
3. Klik **New repository secret** → tambahkan 2 secret:

| Name | Value |
|------|-------|
| `TELEGRAM_DEV_BOT_TOKEN` | Token dari BotFather |
| `TELEGRAM_DEV_CHAT_ID` | Chat ID dari @userinfobot |

---

## Step 4: Test Lokal

Jalankan agent dalam test mode (pakai dummy data):

```bash
# Harus ada TELEGRAM_DEV_BOT_TOKEN & TELEGRAM_DEV_CHAT_ID di .env dulu
npm run incident:test
```

Kamu akan menerima pesan di Telegram seperti ini:

```
🚨 CI/CD INCIDENT ALERT

📁 Repo: ambardws/dompetku
🌿 Branch: develop
👤 Triggered by: @ambar (push)
💥 Failed at: 🧪 Testing
🔗 Commit: abc1234

─────────────────────────
🧪 Root Cause Analysis
Kategori: Unit Test Gagal

💡 Saran:
Periksa perubahan terakhir pada file yang dites...

─────────────────────────
📋 Error Log (snippet):
FAIL src/modules/transactions/...
AssertionError: Expected 1 received 0

─────────────────────────
🔗 Lihat Full Log di GitHub Actions

⏰ 30/3/2026, 17.30 WIB
```

---

## Cara Kerja CI/CD

Pipeline `.github/workflows/ci.yml` yang sudah diupdate:

```
push/PR ke main atau develop
        ↓
  test-and-analyze job
        ↓
  ┌─── PASS ───┐     ┌─── FAIL ───┐
  │  SonarCloud│     │  Capture   │
  │  Coverage  │     │  error logs│
  └────────────┘     └─────┬──────┘
                           ↓
                   incident-response job
                           ↓
                   incident-agent.mjs
                           ↓
                   Telegram Dev Bot 🚨
```

---

## Error Patterns yang Dideteksi Otomatis

| Pattern | Label | Trigger |
|---------|-------|---------|
| `FAIL src/`, `AssertionError` | Unit Test Gagal | Vitest failure |
| `TS\d+:`, `Type is not assignable` | TypeScript Error | TS compile error |
| `Cannot find module` | Import Error | File tidak ditemukan |
| `nuxt build.*failed` | Build Gagal | Nuxt build error |
| `Quality Gate.*FAILED` | SonarCloud Gate | Coverage/quality turun |
| `npm ERR!`, `ERESOLVE` | npm Install Error | Dependency conflict |
| `Timeout.*exceeded` | Test Timeout | Async test hang |
| `process.env.*undefined` | Env Var Hilang | Missing secret |

---

## File yang Dibuat

```
dompetku/
├── scripts/
│   └── incident-agent.mjs          ← Core agent (root cause analysis + notif)
├── .github/workflows/
│   ├── ci.yml                       ← Updated: panggil incident-response saat fail
│   └── incident-response.yml        ← Workflow untuk menjalankan agent
├── .env                             ← Tambahkan TELEGRAM_DEV_BOT_TOKEN & CHAT_ID
└── DEV_BOT_SETUP.md                 ← File ini
```
