<template>
  <div class="analytics-card">
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h3>
        <slot name="actions" />
      </div>
    </div>

    <div class="p-6">
      <!-- Summary Stats -->
      <div v-if="summary" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="stat-item group">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Pemasukan</p>
          </div>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Rp {{ formatAmount(summary.totalIncome) }}</p>
        </div>

        <div class="stat-item group">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Pengeluaran</p>
          </div>
          <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">Rp {{ formatAmount(summary.totalExpense) }}</p>
        </div>

        <div class="stat-item group">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Saldo</p>
          </div>
          <p
            class="text-2xl font-bold"
            :class="summary.balance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600 dark:text-rose-400'"
          >
            Rp {{ formatAmount(summary.balance) }}
          </p>
        </div>
      </div>

      <!-- Top Categories -->
      <div v-if="summary && (summary.topExpenseCategory || summary.topIncomeCategory)" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <!-- Top Expense -->
        <div v-if="summary.topExpenseCategory" class="top-category bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center border border-rose-100 dark:border-rose-800">
              <svg class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <p class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Pengeluaran Terbesar
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              :style="{ backgroundColor: summary.topExpenseCategory.categoryColor + '20' }"
            >
              {{ summary.topExpenseCategory.categoryIcon }}
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-900 dark:text-white mb-1">
                {{ summary.topExpenseCategory.categoryName }}
              </p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                Rp {{ formatAmount(summary.topExpenseCategory.totalAmount) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ summary.topExpenseCategory.percentage }}% dari total
              </p>
            </div>
          </div>
        </div>

        <!-- Top Income -->
        <div v-if="summary.topIncomeCategory" class="top-category bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Pemasukan Terbesar
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              :style="{ backgroundColor: summary.topIncomeCategory.categoryColor + '20' }"
            >
              {{ summary.topIncomeCategory.categoryIcon }}
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-900 dark:text-white mb-1">
                {{ summary.topIncomeCategory.categoryName }}
              </p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                Rp {{ formatAmount(summary.topIncomeCategory.totalAmount) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ summary.topIncomeCategory.percentage }}% dari total
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Expense Chart -->
        <div v-if="summary && summary.expenseByCategory.length > 0" class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5">
          <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400"></div>
            Pengeluaran per Kategori
          </h4>
          <DCategoryChart
            :categories="summary.expenseByCategory"
            title="Pengeluaran"
            :size="chartSize"
          />
        </div>

        <!-- Income Chart -->
        <div v-if="summary && summary.incomeByCategory.length > 0" class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5">
          <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
            Pemasukan per Kategori
          </h4>
          <DCategoryChart
            :categories="summary.incomeByCategory"
            title="Pemasukan"
            :size="chartSize"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!summary || (summary.expenseByCategory.length === 0 && summary.incomeByCategory.length === 0)"
        class="text-center py-16"
      >
        <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <svg
            class="w-10 h-10 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p class="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Belum ada data transaksi untuk periode ini</p>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Mulai tambahkan transaksi untuk melihat analisis</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsSummary } from '~modules/analytics/domain/entities/CategoryAnalytics'
import DCategoryChart from '../molecules/DCategoryChart.vue'

interface Props {
  summary: AnalyticsSummary | null
  title?: string
  chartSize?: number
}

withDefaults(defineProps<Props>(), {
  title: 'Analisis Keuangan',
  chartSize: 200,
})

const formatAmount = (amount: number): string => {
  return Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.analytics-card {
  @apply bg-white dark:bg-gray-800;
}

.stat-item {
  @apply p-5 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600;
  transition: all 0.2s ease;
}

.stat-item:hover {
  @apply shadow-sm border-gray-300 dark:border-gray-500 -translate-y-0.5;
}

.top-category {
  transition: all 0.2s ease;
}

.top-category:hover {
  @apply shadow-sm border-gray-300 dark:border-gray-500 -translate-y-0.5;
}
</style>
