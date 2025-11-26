# 📘 Dompetku — Development Guide (Vibecoding Edition)

Dokumentasi ini adalah panduan development untuk membangun aplikasi **Dompetku (PWA)** menggunakan pendekatan **clean architecture**, **atomic design**, **TDD**, **FDD**, **DRY**, serta prinsip **vibecoding** — kode rapi, mengalir, dan enak dilihat.

Teknologi inti:
- **Nuxt 3** (Frontend)
- **TailwindCSS** + **Nuxt UI** (UI)
- **Supabase** (Database, Auth, Storage)
- Optional: Bot WA/Tele untuk input cepat

---

# 🧱 1. Project Structure
Struktur berikut menerapkan clean architecture + atomic design.

```
project/
│
├── src/
│   ├── modules/            # FDD: fitur dipisah per modul
│   │   ├── transactions/
│   │   │   ├── domain/         # entity, repo interface
│   │   │   ├── application/    # use-case
│   │   │   ├── infrastructure/ # supabase queries
│   │   │   └── ui/             # atomic design components
│   │   │       ├── atoms/
│   │   │       ├── molecules/
│   │   │       ├── organisms/
│   │   │       ├── templates/
│   │   │       └── pages/
│   │   └── auth/
│   │       └── ...
│   │
│   ├── shared/
│   │   ├── components/      # global UI
│   │   ├── utils/           # helpers (DRY)
│   │   ├── services/        # supabase client, logger, parser
│   │   └── config/
│   │
│   ├── tests/               # TDD: unit, integration
│   └── app.vue
│
├── supabase/                # migrations, policies
└── README.md
```

---

# 🧩 2. Domain Design (Transactions Module)
Entity: `Transaction`
```
interface Transaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  note?: string
  createdAt: Date
}
```

Repository Interface:
```
interface TransactionRepository {
  add(t: Transaction): Promise<void>
  getByPeriod(userId: string, from: Date, to: Date): Promise<Transaction[]>
  delete(id: string): Promise<void>
}
```

---

# ⚙️ 3. Use Case Example (Application Layer)
### ➤ AddTransactionUseCase
```
execute(input) {
  validate(input)
  const entity = mapToEntity(input)
  return repo.add(entity)
}
```

### ➤ ParseBotCommandUseCase
Input: `"- makan 25k"`
Output:
```
{
  type: 'expense',
  category: 'makan',
  amount: 25000
}
```

---

# 🗄️ 4. Supabase Setup
### Tabel `transactions`
```
- id (uuid)
- user_id (uuid)
- type (text)
- amount (int)
- category (text)
- note (text)
- created_at (timestamptz)
```

### Row Level Security (RLS)
Aktifkan → Tambahkan policy:
```
user_id = auth.uid()
```

### Menggunakan Supabase di Nuxt
```
// shared/services/supabase.ts
export const supabase = createClient(
  useRuntimeConfig().SUPABASE_URL,
  useRuntimeConfig().SUPABASE_KEY
)
```

---

# 🎨 5. Atomic Design Folder Example
```
ui/
├── atoms/
│   ├── Button.vue
│   ├── Icon.vue
│   └── TextInput.vue
├── molecules/
│   ├── InputAmount.vue
│   └── TransactionRow.vue
├── organisms/
│   └── TransactionList.vue
├── templates/
│   └── DashboardTemplate.vue
└── pages/
    └── index.vue
```

---

# 🧪 6. TDD — Testing Strategy
### 1. Unit Test
- parsing command
- mapping input → entity
- validation

### 2. Integration Test
- supabase query
- add + get transaction

### 3. UI Snapshot Test
- atomic components

```
# Example
parseCommand("- makan 20k") → {
  type: 'expense', amount: 20000
}
```

---

# 🚀 7. FDD (Feature-driven Development) Flow
Contoh flow untuk fitur **add transaction**:
1. Define feature goal
2. Buat user story
3. Buat domain + use case
4. TDD untuk logic
5. Buat UI atomic step-by-step
6. Integrasi Supabase
7. QA + refinement

---

# 🎧 8. Vibecoding Rules (for Dompetku)
Agar development tetap halus dan enak:

### ✔ Kode harus *nyaman dibaca*
- spacing rapi
- nama variabel human-friendly

### ✔ Folder tidak boleh chaos
- clean architecture → strict
- atomic design → konsisten

### ✔ Komponen tipis, logic di use-case

### ✔ UI flowing & calm
- padding lega
- warna lembut
- animasi halus

### ✔ Jangan over-engineer
- tetap MVP oriented
- FDD step by step

### ✔ Developer harus happy 😎
- kalau coding bikin stress → break dulu

---

# 📝 9. Backlog MVP
- [ ] Auth (login/register)
- [ ] Create transaction (manual)
- [ ] Input via bot command parser
- [ ] Dashboard summary
- [ ] Transaction list + filter
- [ ] Offline mode PWA
- [ ] Sync ke Supabase

---

# 📦 10. Build & Deploy
### Development
```
npm install
npm run dev
```

### Deploy ke Vercel
- Tambahkan env Supabase
- Jalankan build

---

Jika kamu ingin, aku bisa tambahkan:
- file README proyek
- struktur folder real
- daftar komponen atomic lengkap
- contoh migration Supabase
- contoh test Jest/Vitest
- atau workflow bot WA/Telegram

