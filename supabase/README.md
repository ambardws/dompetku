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
- Schema lengkap (id, user_id, type, amount, category, note, timestamps)
- Indexes untuk performa query
- Row Level Security (RLS) policies
- Auto-update trigger untuk updated_at

## Database Schema

### Table: transactions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key ke auth.users |
| type | TEXT | 'income' atau 'expense' |
| amount | INTEGER | Amount dalam rupiah (cent) |
| category | TEXT | Kategori transaksi |
| note | TEXT | Catatan opsional |
| created_at | TIMESTAMPTZ | Waktu dibuat |
| updated_at | TIMESTAMPTZ | Waktu terakhir diupdate |

### RLS Policies
- Users hanya bisa CRUD transaksi mereka sendiri
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
