# Netlify Deployment Guide - Dompetku

## ⚠️ PENTING: Konfigurasi Netlify Dashboard

Sebelum deploy, pastikan setting berikut di Netlify Dashboard:

### Build Settings
```
Build command: npm run build
Publish directory: (kosongkan atau hapus)
Functions directory: .netlify/functions-internal
```

**CRITICAL:** Jangan set `Publish directory` ke `dist`. Biarkan kosong atau hapus value-nya. Nitro akan auto-detect yang benar.

### Deploy Settings
- ✅ Auto Publishing: Enabled
- ✅ Deploy Previews: Enabled (opsional)
- ✅ Branch deploys: Only production branch

## Masalah yang Diperbaiki

### 1. Error "[nuxt] instance unavailable" saat reload page
**Penyebab:** Netlify tidak menggunakan SSR Netlify Functions, melainkan serving static files.

**Solusi:**
- Biarkan Nitro handle konfigurasi Netlify (jangan override publish directory)
- Aktifkan SSR di `nuxt.config.ts`
- Minimal `netlify.toml` configuration

### 2. Error "Cannot find module 'xlsx/dist/cpexcel.js'"
**Penyebab:** Library `xlsx` di-bundle untuk SSR yang tidak kompatibel dengan serverless environment.

**Solusi:**
- Ubah static import menjadi dynamic import di `ExportTransactionsUseCase.ts`
- Library `xlsx` sekarang hanya di-load di client-side saat dibutuhkan

### 3. Error "500 - [nuxt] instance unavailable" di route `/`
**Penyebab:** Auth middleware di `index.vue` berjalan di server-side dan error saat mengakses Supabase.

**Solusi:**
- Skip middleware execution di server-side dengan `if (process.server) return`
- Tambahkan try-catch error handling di middleware
- Auth check hanya berjalan di client-side

## Struktur Build Netlify

```
.netlify/
└── functions-internal/
    └── server/
        ├── main.mjs              # Entry point Netlify Function
        ├── chunks/
        │   ├── _/
        │   │   ├── xlsx.mjs      # xlsx library (lazy loaded)
        │   │   └── nitro.mjs     # Nitro runtime
        │   ├── build/
        │   └── routes/
        └── package.json

dist/                             # Static files (CSS, JS, images)
```

## Konfigurasi File

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = ".netlify/functions-internal"
  node_bundler = "esbuild"
  included_files = ["**"]

[[redirects]]
  from = "/_nuxt/*"
  to = "/_nuxt/:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

### nuxt.config.ts (Konfigurasi Penting)
```typescript
export default defineNuxtConfig({
  ssr: true,  // Enable SSR

  nitro: {
    preset: 'netlify',
    serveStatic: true
  },

  // ... konfigurasi lainnya
})
```

## Environment Variables di Netlify

Pastikan set environment variables berikut di Netlify Dashboard:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Cara Deploy

### Via Git (Recommended)

1. Commit dan push ke repository:
```bash
git add .
git commit -m "Fix Netlify SSR deployment"
git push
```

2. Netlify akan otomatis trigger build dan deploy

### Via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login ke Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

## Struktur Redirects

1. **Static Assets** (`/_nuxt/*`):
   - Served langsung dari `dist/_nuxt/`
   - Tidak melalui Functions

2. **API Routes** (`/api/*`):
   - Diarahkan ke `.netlify/functions/server/`
   - Menggunakan Nitro server handler

3. **All Other Routes** (`/*`):
   - Diarahkan ke `.netlify/functions/server`
   - SSR rendering melalui Nuxt

## Troubleshooting

### Error: "instance unavailable"
- **Cek:** Apakah redirects di `netlify.toml` mengarah ke Functions?
- **Cek:** Apakah SSR enabled di `nuxt.config.ts`?
- **Cek:** Apakah folder `.netlify/functions-internal/` ada setelah build?

### Error: "Cannot find module xlsx"
- **Cek:** Apakah `ExportTransactionsUseCase.ts` menggunakan dynamic import?
- **Cek:** Apakah method `execute()` dan `exportToExcel()` adalah async?

### Error: Functions not working
- **Cek:** Environment variables sudah di-set di Netlify Dashboard
- **Cek:** Node version di Netlify (harus 20)
- **Cek:** Build command di Netlify: `npm run build`

## Verifikasi Deployment Berhasil

1. **Akses homepage** - Harus loading tanpa error
2. **Reload page** - Tidak boleh muncul "[nuxt] instance unavailable"
3. **Export Excel** - Harus bisa download file .xlsx
4. **API Endpoints** - `/api/hello` harus return response
5. **Bot Webhook** - `/api/bot/telegram/webhook` harus bisa receive POST

## Build Information

- **Client Size:** ~972 KB (gzipped: ~143 KB)
- **Server Size:** ~4.23 MB (gzipped: ~1.09 MB)
- **Build Time:** ~15-20 seconds
- **Functions Runtime:** Node.js 20
- **Preset:** Netlify Edge Functions

## Best Practices

1. **Always use dynamic imports** untuk libraries yang tidak serverless-friendly
2. **Set explicit SSR mode** di nuxt.config.ts
3. **Test locally** dengan `npm run build && npm run preview` sebelum deploy
4. **Monitor Functions logs** di Netlify Dashboard setelah deploy
5. **Use environment variables** untuk sensitive data

## Support

Jika masih ada masalah:
1. Cek Netlify Functions logs
2. Cek browser console untuk error
3. Verifikasi environment variables
4. Review build logs di Netlify
