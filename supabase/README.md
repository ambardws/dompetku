# Supabase Setup

Folder ini berisi database migrations dan konfigurasi Supabase untuk Dompetku.

## Setup Lokal dengan Supabase CLI

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login ke Supabase
```bash
supabase login
```

### 3. Link ke Project
```bash
supabase link --project-ref your-project-ref
```

### 4. Apply Migrations
```bash
supabase db push
```

## Migrations

### 20250124000001_create_transactions_table.sql
Membuat tabel `transactions` dengan:
- Schema lengkap (id, user_id, type, amount, category_id, note, timestamps)
- Indexes untuk performa query
- Row Level Security (RLS) policies
- Auto-update trigger untuk updated_at

### 20250124000002_create_categories.sql
Membuat tabel `categories` dengan:
- Schema lengkap (id, user_id, name, icon, color, type, is_default, timestamps)
- Indexes untuk performa query
- RLS policies
- Auto-update trigger untuk updated_at

### 20250124000004_create_budgets.sql
Membuat tabel `budgets` dengan:
- Schema lengkap (id, user_id, category_id, amount, period, timestamps)
- Foreign key ke categories (UUID)
- Unique constraint (user_id, category_id)
- Indexes untuk performa query
- RLS policies
- Auto-update trigger untuk updated_at

## Database Schema

### Table: transactions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key ke auth.users |
| type | TEXT | 'income' atau 'expense' |
| amount | INTEGER | Amount dalam rupiah (cent) |
| category_id | UUID | Foreign key ke categories |
| note | TEXT | Catatan opsional |
| created_at | TIMESTAMPTZ | Waktu dibuat |
| updated_at | TIMESTAMPTZ | Waktu terakhir diupdate |

### Table: categories
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key ke auth.users |
| name | TEXT | Nama kategori |
| icon | TEXT | Icon untuk kategori |
| color | TEXT | Warna untuk kategori |
| type | TEXT | 'income' atau 'expense' |
| is_default | BOOLEAN | System default atau custom |
| created_at | TIMESTAMPTZ | Waktu dibuat |
| updated_at | TIMESTAMPTZ | Waktu terakhir diupdate |

### Table: budgets
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key ke auth.users |
| category_id | UUID | Foreign key ke categories |
| amount | DECIMAL(15,2) | Budget limit per bulan |
| period | TEXT | 'monthly' |
| created_at | TIMESTAMPTZ | Waktu dibuat |
| updated_at | TIMESTAMPTZ | Waktu terakhir diupdate |

### RLS Policies
- Users hanya bisa CRUD data mereka sendiri
- Semua operasi memverifikasi `auth.uid() = user_id`

## Testing Migrations Locally

Untuk testing lokal tanpa affect production:

```bash
# Start local Supabase
supabase start

# Apply migrations locally
supabase db reset

# Check status
supabase status
```
