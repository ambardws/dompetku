# PWA Setup Guide - Dompetku

## ✅ Konfigurasi PWA Sudah Aktif

Aplikasi Dompetku sudah dikonfigurasi sebagai Progressive Web App (PWA) dengan:
- Service Worker auto-update
- Offline caching untuk Supabase API
- Manifest dengan konfigurasi lengkap
- Install prompt otomatis

## 📱 Cara Membuat Icon PWA

### Opsi 1: Convert SVG ke PNG (Recommended)

1. Buka file `public/icon.svg` yang sudah dibuat
2. Gunakan tool online untuk convert:
   - https://svgtopng.com/
   - https://cloudconvert.com/svg-to-png
   
3. Export dengan ukuran:
   - **512x512** → simpan sebagai `public/icon-512.png`
   - **192x192** → simpan sebagai `public/icon-192.png`
   - **32x32** → simpan sebagai `public/favicon.png`

### Opsi 2: Gunakan Figma/Canva

1. Buat design 512x512 px dengan:
   - Background: `#10b981` (emerald green)
   - Icon: Wallet atau simbol Rupiah
   - Rounded corners: 115px radius
   
2. Export sebagai PNG dengan ukuran di atas

### Opsi 3: Gunakan Icon Generator

Gunakan tool seperti:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

Upload icon 512x512 dan generate semua ukuran sekaligus.

## 🧪 Testing PWA

### Development Mode
```bash
npm run dev
```
PWA sudah aktif di development mode.

### Production Build
```bash
npm run build
npm run preview
```

### Install di Browser

**Desktop (Chrome/Edge):**
1. Buka aplikasi di browser
2. Klik icon "Install" di address bar
3. Atau: Menu → Install Dompetku

**Mobile (Chrome/Safari):**
1. Buka aplikasi di browser
2. Tap menu (⋮ atau share icon)
3. Pilih "Add to Home Screen"

## 📋 Checklist

- [x] PWA configuration di `nuxt.config.ts`
- [x] Service Worker setup
- [x] Manifest configuration
- [ ] Icon 512x512 (`public/icon-512.png`)
- [ ] Icon 192x192 (`public/icon-192.png`)
- [ ] Favicon (`public/favicon.png`)
- [ ] Test install di Chrome Desktop
- [ ] Test install di Mobile

## 🎨 Design Specs

**Theme Color:** `#10b981` (Emerald Green)
**Background:** `#ffffff` (White)
**Display Mode:** `standalone`
**Orientation:** `portrait`

## 🚀 Deploy

Setelah icon dibuat dan aplikasi di-deploy ke Netlify:
1. Buka URL production
2. Install sebagai PWA
3. Aplikasi akan berfungsi offline!

## 📝 Notes

- Icon SVG template sudah tersedia di `public/icon.svg`
- Anda bisa edit SVG untuk customize design
- Pastikan icon terlihat jelas di ukuran kecil (192px)
- Test di berbagai device untuk memastikan icon terlihat bagus
