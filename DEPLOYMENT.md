# Deployment Guide - Dompetku

Panduan deployment aplikasi Dompetku ke platform hosting gratis.

## Platform Gratis yang Direkomendasikan

### 1. Vercel (Recommended)
- ✅ Free tier unlimited untuk personal projects
- ✅ Auto deployment dari GitHub
- ✅ Support Nuxt 3 native
- ✅ Edge functions gratis
- ✅ Custom domain gratis

### 2. Netlify
- ✅ Free tier 100GB bandwidth/bulan
- ✅ Auto deployment dari GitHub
- ✅ Support Nuxt 3
- ✅ Form handling gratis

### 3. Cloudflare Pages
- ✅ Unlimited bandwidth gratis
- ✅ Fast global CDN
- ✅ Support Nuxt 3

---

## Pre-Deployment Checklist

### 1. Environment Variables yang Diperlukan

```env
# Supabase Configuration
SUPABASE_URL=https://elytjqsaggnbiaobkyhl.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Supabase Service Role (untuk server-side)
SUPABASE_SERVICE_KEY=your_service_role_key
```

### 2. Update nuxt.config.ts

Pastikan konfigurasi sudah production-ready:

```typescript
export default defineNuxtConfig({
  // ... existing config

  runtimeConfig: {
    // Server-side only (tidak akan exposed ke client)
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

    // Client-side (akan exposed ke browser)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  }
})
```

### 3. Hapus Hardcoded Secrets

**PENTING**: Jangan commit secrets ke Git!

Update `nuxt.config.ts` - hapus hardcoded values:

```typescript
supabase: {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
  redirect: false,
  redirectOptions: {
    login: '/auth/login',
    callback: '/auth/callback',
    exclude: ['/', '/auth/*']
  }
},

runtimeConfig: {
  public: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY
  },
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
}
```

---

## Deployment ke Vercel (Recommended)

### Step 1: Persiapan Repository

```bash
# Pastikan semua changes sudah di commit
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy ke Vercel

1. **Buka Vercel Dashboard**
   - Kunjungi [vercel.com](https://vercel.com)
   - Sign in dengan GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select repository `dompetku`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Nuxt.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.output/public` (default)

4. **Set Environment Variables**

   Di Vercel Dashboard, tambahkan environment variables:

   ```
   SUPABASE_URL=https://elytjqsaggnbiaobkyhl.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Setup Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records sesuai instruksi Vercel
4. Wait for DNS propagation (5-10 minutes)

### Step 4: Setup Telegram Webhook

Update webhook URL ke domain production:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project.vercel.app/api/bot/telegram/webhook"
  }'
```

---

## Deployment ke Netlify

### Step 1: Persiapan

Buat file `netlify.toml` di root project:

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy

1. **Buka Netlify Dashboard**
   - Kunjungi [netlify.com](https://netlify.com)
   - Sign in dengan GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select repository `dompetku`

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.output/public`
   - Click "Show advanced" → "New variable"

4. **Environment Variables**

   Tambahkan:
   ```
   SUPABASE_URL=https://elytjqsaggnbiaobkyhl.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

5. **Deploy Site**
   - Click "Deploy site"
   - Your app will be live at `https://random-name.netlify.app`

---

## Deployment ke Cloudflare Pages

### Step 1: Setup

1. **Buka Cloudflare Pages**
   - Kunjungi [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign in / Sign up

2. **Create Project**
   - Click "Create a project"
   - Connect to GitHub
   - Select `dompetku` repository

3. **Build Configuration**
   - Framework preset: **Nuxt.js**
   - Build command: `npm run build`
   - Build output: `.output/public`

4. **Environment Variables**

   Di Settings → Environment variables:
   ```
   SUPABASE_URL=https://elytjqsaggnbiaobkyhl.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

5. **Save and Deploy**

---

## Post-Deployment

### 1. Test Aplikasi

Cek semua fitur:
- ✅ Login / Register
- ✅ Dashboard loading
- ✅ Tambah transaction
- ✅ Categories management
- ✅ Dark mode
- ✅ Telegram bot integration

### 2. Setup Supabase Auth Redirect URLs

Di Supabase Dashboard → Authentication → URL Configuration:

**Allowed redirect URLs:**
```
https://your-domain.vercel.app
https://your-domain.vercel.app/**
http://localhost:3000
http://localhost:3000/**
```

**Site URL:**
```
https://your-domain.vercel.app
```

### 3. Monitor Logs

#### Vercel
- Dashboard → Your Project → Logs
- Real-time function logs

#### Netlify
- Site Dashboard → Deploys → Function logs

### 4. Enable HTTPS (Auto)

Semua platform di atas automatically provide SSL certificate gratis via Let's Encrypt.

---

## Troubleshooting

### Build Failed

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules .nuxt
npm install
npm run build
```

**Error: Environment variable undefined**
- Check spelling di dashboard
- Restart deployment after adding env vars

### Runtime Errors

**401 Unauthorized from Supabase**
- Check SUPABASE_URL dan SUPABASE_KEY
- Verify Supabase redirect URLs

**Telegram webhook not working**
- Check webhook URL is correct
- Verify bot token
- Check function logs for errors

### Performance Issues

**Slow initial load**
- Enable SWR caching
- Optimize images
- Use Nuxt image module

---

## Auto Deployment

Semua platform support auto deployment:

1. Push to `main` branch → Auto deploy to production
2. Push to `dev` branch → Auto deploy to preview (optional)
3. Pull request → Auto deploy preview

### Setup Branch Deployment (Vercel)

1. Go to Project Settings → Git
2. Enable "Automatically expose System Environment Variables"
3. Set production branch: `main`
4. Set preview branches: `dev`, `staging`

---

## Cost Estimation (Free Tier Limits)

### Vercel
- ✅ Bandwidth: 100GB/month
- ✅ Build time: 6000 minutes/month
- ✅ Serverless function executions: Unlimited
- ✅ Team members: 1 (hobby plan)

### Netlify
- ✅ Bandwidth: 100GB/month
- ✅ Build minutes: 300/month
- ✅ Serverless functions: 125k requests/month

### Cloudflare Pages
- ✅ Bandwidth: Unlimited
- ✅ Builds: 500/month
- ✅ Requests: Unlimited

---

## Best Practices

### 1. Security

- ✅ Never commit secrets to Git
- ✅ Use environment variables
- ✅ Enable Supabase RLS (Row Level Security)
- ✅ Rotate API keys regularly

### 2. Performance

- ✅ Enable edge caching
- ✅ Optimize images
- ✅ Use lazy loading
- ✅ Minimize bundle size

### 3. Monitoring

- ✅ Setup error tracking (Sentry)
- ✅ Monitor function logs
- ✅ Track Core Web Vitals
- ✅ Setup uptime monitoring

---

## Kesimpulan

**Rekomendasi Platform:**

1. **Vercel** - Best for beginners, excellent DX
2. **Cloudflare Pages** - Best for high traffic (unlimited bandwidth)
3. **Netlify** - Good middle ground

Semua platform di atas **100% gratis** untuk personal projects dan sudah include:
- ✅ SSL Certificate
- ✅ Global CDN
- ✅ Auto deployment
- ✅ Preview deployments
- ✅ Custom domains

**Estimated Time to Deploy:** 10-15 minutes

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
