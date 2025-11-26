# 💰 Dompetku

**Personal Finance Tracker PWA** - Kelola keuangan dengan mudah, rapi, dan nyaman.

[![Tests](https://img.shields.io/badge/tests-37%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Nuxt](https://img.shields.io/badge/Nuxt-3-00DC82)]()

---

## 🎯 Features

- ✅ **Transaction Management** - Add, view, edit, delete transactions
- ✅ **Financial Summary** - Real-time balance, income, and expense tracking
- ✅ **Smart Input** - Quick amount buttons (10k, 25k, 50k)
- ✅ **Transaction Filtering** - Filter by income/expense
- ✅ **Bot Command Parser** - Parse commands like "- makan 25k"
- 🚧 **PWA Support** - Offline mode (coming soon)
- 🚧 **Authentication** - User login/register (coming soon)

---

## 🏗️ Architecture

Project ini menggunakan **Clean Architecture** dan **Atomic Design**:

```
src/
├── modules/
│   └── transactions/
│       ├── domain/          # Business entities & interfaces
│       ├── application/     # Use cases (business logic)
│       ├── infrastructure/  # Supabase implementation
│       └── ui/              # Atomic design components
│           ├── atoms/       # Button, Input, Icon
│           ├── molecules/   # InputAmount, TransactionRow
│           └── organisms/   # TransactionForm, TransactionList
└── shared/
    ├── composables/         # Reusable logic
    └── services/            # External services
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` dengan Supabase credentials:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

### 3. Setup Database

```bash
# Login ke Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage
```

**Test Results:**
- ✅ 37 unit tests passing
- ✅ 100% use case coverage
- ✅ Edge cases covered

---

## 🛠️ Tech Stack

- **Frontend:** Nuxt 3, Vue 3, TypeScript
- **Styling:** TailwindCSS, Nuxt UI
- **Database:** Supabase (PostgreSQL)
- **Testing:** Vitest, Vue Test Utils
- **Architecture:** Clean Architecture, Atomic Design
- **Methodology:** TDD, FDD, DRY, Vibecoding

---

## 📦 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy to Vercel, Netlify, atau platform lainnya. Pastikan environment variables sudah diset.

---

## 📝 Documentation

- [Development Guide](.dev/dompetku_dev_guide.md) - Complete development guide
- [Progress Report](.dev/PROGRESS_REPORT.md) - Project progress & next steps
- [Supabase Setup](supabase/README.md) - Database setup instructions

---

## 🎨 Vibecoding Principles

Project ini mengikuti **vibecoding** principles:

- 🌊 **Smooth UX** - Animasi halus, transisi yang enak
- 🎨 **Calm Colors** - Warna lembut, tidak menyakiti mata
- 📐 **Spacious Layout** - Padding lega, tidak cramped
- 🧘 **Developer Happiness** - Kode yang nyaman dibaca dan di-maintain

---

## 📊 Project Status

**Current Phase:** MVP Phase 1 Complete ✅

**Completed:**
- ✅ Transaction CRUD operations
- ✅ Dashboard with summary cards
- ✅ Clean architecture implementation
- ✅ Atomic design UI components
- ✅ 37 passing unit tests
- ✅ Supabase integration

**Next Steps:**
- 🚧 Authentication module
- 🚧 PWA offline mode
- 🚧 Bot integration (WhatsApp/Telegram)
- 🚧 Analytics dashboard

---

## 🤝 Contributing

This is a personal project, tapi kalau ada suggestions atau improvements, feel free to open an issue!

---

## 📄 License

MIT License - Feel free to use for learning purposes

---

**Built with ❤️ using Vibecoding methodology**
