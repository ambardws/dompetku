# 🤖 Telegram Bot Integration Setup

## Overview
Bot Telegram Dompetku memungkinkan user untuk:
- Link akun Telegram ke akun Dompetku
- Add transaksi via chat Telegram
- Format: `- makan 25k` atau `+ gaji 5jt`

## 🗄️ Step 1: Setup Database

1. Buka **Supabase Dashboard** → SQL Editor
2. Copy & paste isi file `supabase/setup_bot_tables.sql`
3. Run SQL query
4. Verify tabel `bot_users` dan `bot_link_tokens` sudah dibuat

## 🔐 Step 2: Setup Bot Token

Bot token sudah ada di `.env.local`:
```
TELEGRAM_BOT_TOKEN=7755000663:AAFeBZuO2PId-w3U04G0PgaGwReV5eO2a3c
```

## 🌐 Step 3: Setup Webhook

### Option A: Using ngrok (Development)

1. Install ngrok: https://ngrok.com/download
2. Run ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy ngrok URL (misal: `https://abcd1234.ngrok.io`)
4. Set webhook URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot7755000663:AAFeBZuO2PId-w3U04G0PgaGwReV5eO2a3c/setWebhook" \
   -H "Content-Type: application/json" \
   -d '{"url": "https://abcd1234.ngrok.io/api/bot/telegram/webhook"}'
   ```

### Option B: Using Production URL

```bash
curl -X POST "https://api.telegram.org/bot7755000663:AAFeBZuO2PId-w3U04G0PgaGwReV5eO2a3c/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url": "https://your-production-domain.com/api/bot/telegram/webhook"}'
```

## 🔗 Step 4: Account Linking Flow

### A. Generate Link Token (Web App)

User harus login ke web app dulu, lalu:

1. Buat endpoint di web app untuk generate token (sudah ada: `/api/bot/link-token`)
2. User klik tombol "Link Telegram Bot"
3. API akan return token, contoh:
   ```json
   {
     "success": true,
     "token": "xyz123abc456...",
     "expiresAt": "2025-01-27T12:30:00Z",
     "message": "Send this token to the bot..."
   }
   ```

### B. Link via Bot (Telegram)

1. User chat bot: `/start`
2. Bot reply: "Send /link [token] to link your account"
3. User chat: `/link xyz123abc456...`
4. Bot call API `/api/bot/link` untuk verify token
5. Akun berhasil di-link!

## 📝 Step 5: Add Transaction

Format command:
```
- makan 25k          → Expense: makan, Rp 25,000
+ gaji 5jt           → Income: gaji, Rp 5,000,000
- transport 15000    → Expense: transport, Rp 15,000
```

Flow:
1. User kirim message ke bot
2. Telegram send webhook ke `/api/bot/telegram/webhook`
3. API parse command dengan `ParseBotCommandUseCase`
4. API create transaction dengan `AddTransactionUseCase`
5. Bot reply konfirmasi

## 🧪 Testing

### Test Webhook
```bash
curl -X POST http://localhost:3000/api/bot/telegram/webhook \
-H "Content-Type: application/json" \
-d '{
  "update_id": 123,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "username": "testuser",
      "first_name": "Test"
    },
    "chat": {
      "id": 123456789
    },
    "text": "- makan 25k",
    "date": 1640000000
  }
}'
```

### Test Link Token Generation
```bash
curl -X POST http://localhost:3000/api/bot/link-token \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_SUPABASE_TOKEN"
```

## 📊 Bot API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bot/telegram/webhook` | POST | Webhook untuk Telegram |
| `/api/bot/link-token` | POST | Generate link token |
| `/api/bot/link` | POST | Link bot account |

## 🐛 Troubleshooting

### Webhook tidak terima message
- Cek webhook info: `curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo`
- Pastikan ngrok running
- Pastikan Nuxt server running di port 3000

### Error "Bot account not linked"
- User harus link account dulu via `/link [token]`
- Token expires dalam 15 menit

### Error parsing command
- Format harus: `[+/-] category amount`
- Contoh valid: `- makan 25k`, `+ gaji 5jt`, `- transport 15000`

## 📚 Command Format Reference

### Amount Format
- `25k` = 25,000
- `2.5k` = 2,500
- `5jt` = 5,000,000
- `1.5jt` = 1,500,000
- `15000` = 15,000

### Type
- `-` atau tanpa prefix = Expense
- `+` = Income

### Examples
```
- makan 25k              ✅
- transport bensin 50k   ✅
+ gaji 5jt               ✅
+ freelance 2.5jt        ✅
makan siang 15000        ✅
```
