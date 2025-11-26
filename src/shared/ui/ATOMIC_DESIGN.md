# Atomic Design Structure

Struktur komponen menggunakan Atomic Design Pattern untuk memisahkan concerns dan meningkatkan reusability.

## Struktur Folder

```
src/shared/ui/
├── atoms/           # Komponen terkecil, tidak bisa dipecah lagi
├── molecules/       # Kombinasi dari atoms
├── organisms/       # Kombinasi dari molecules dan atoms
└── templates/       # Layout templates (optional)
```

## Komponen yang Sudah Dibuat

### Atoms (Komponen Terkecil)
- **DSummaryCard** - Card untuk menampilkan summary (balance, income, expense)
  - Props: `label`, `value`, `variant`, `subtitle`
  - Variants: `balance`, `income`, `expense`, `neutral`
  - Location: `src/shared/ui/atoms/DSummaryCard.vue`

### Molecules (Kombinasi Atoms)
- **DSummaryCards** - Container untuk 3 summary cards (balance, income, expense)
  - Props: `summary` (object dengan balance, income, expense)
  - Location: `src/shared/ui/molecules/DSummaryCards.vue`

- **DQuickActions** - Container untuk quick action buttons
  - Slots: default (untuk buttons), right (untuk komponen di kanan)
  - Location: `src/shared/ui/molecules/DQuickActions.vue`

### Organisms (Kombinasi Molecules & Atoms)
- **DPageHeader** - Header halaman dengan logo, title, user info, dan logout
  - Props: `title`, `subtitle`, `icon`, `userEmail`, `showLogout`
  - Events: `logout`
  - Location: `src/shared/ui/organisms/DPageHeader.vue`

## Prinsip Atomic Design

1. **Atoms** - Komponen dasar seperti button, input, card, badge
2. **Molecules** - Kombinasi atoms untuk fungsi spesifik (form group, card with button)
3. **Organisms** - Bagian UI yang kompleks (header, navigation, form section)
4. **Templates** - Layout page structure
5. **Pages** - Implementasi konkret dari templates

## Color Scheme - Minimalist Neutral

Aplikasi menggunakan warna yang minimalis dan tidak ramai:

### Primary Colors
- **Gray Scale**: gray-50 → gray-900 (neutral backgrounds dan text)
- **White**: bg-white dengan border-gray-200 (cards dan containers)

### Accent Colors (Subtle)
- **Income (Emerald)**: emerald-50 (bg), emerald-100 (border), emerald-600 (text/icon)
- **Expense (Rose)**: rose-50 (bg), rose-100 (border), rose-600 (text/icon)
- **Neutral Icons**: gray-100 (bg), gray-700 (icon)

### Design Principles
- No vibrant gradients - solid colors only
- Subtle borders (gray-200, gray-300)
- Minimal shadows (shadow-sm on hover)
- Clean borders and rounded corners (rounded-lg, rounded-xl)

## Cara Menggunakan

### Import dan Gunakan Komponen

```vue
<template>
  <div>
    <!-- Page Header -->
    <DPageHeader
      title="My App"
      subtitle="Manage your finances"
      :user-email="user?.email"
      @logout="handleLogout"
    />

    <!-- Summary Cards -->
    <DSummaryCards :summary="summaryData" />

    <!-- Quick Actions -->
    <DQuickActions>
      <button>Action 1</button>
      <button>Action 2</button>

      <template #right>
        <DPeriodSelector />
      </template>
    </DQuickActions>
  </div>
</template>

<script setup lang="ts">
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DSummaryCards from '~shared/ui/molecules/DSummaryCards.vue'
import DQuickActions from '~shared/ui/molecules/DQuickActions.vue'

const summaryData = {
  balance: 1000000,
  income: 500000,
  expense: 300000
}
</script>
```

## Benefits

1. **Reusability** - Komponen dapat digunakan di berbagai halaman
2. **Maintainability** - Perubahan di satu komponen affect semua usage
3. **Consistency** - Design system yang konsisten across app
4. **Scalability** - Mudah menambah komponen baru
5. **Clean Code** - HTML di halaman utama lebih ringkas dan readable
