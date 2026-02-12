<template>
  <div
    class="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all duration-200 group"
  >
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <div
        :class="[
          'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
          transaction.type === 'income'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800'
        ]"
      >
        <DIcon
          :name="transaction.type === 'income' ? 'plus' : 'minus'"
          :size="18"
          :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p
          class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate"
          :title="transaction.category"
        >
          {{ transaction.category }}
        </p>
        <p
          v-if="transaction.note"
          class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate"
          :title="transaction.note"
        >
          {{ transaction.note }}
        </p>
        <p class="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {{ formatDate(transaction.transactionDate) }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <div class="text-right min-w-[90px] sm:min-w-[110px]">
        <p
          :class="[
            'font-bold text-sm sm:text-base truncate',
            transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          ]"
          :title="`${transaction.type === 'income' ? '+' : '-'}Rp ${formatAmount(transaction.amount)}`"
        >
          {{ transaction.type === 'income' ? '+' : '-' }}Rp {{ formatAmount(transaction.amount) }}
        </p>
      </div>

      <div class="flex gap-1 transition-all duration-200">
        <button
          type="button"
          class="p-2 sm:p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-110 active:scale-95"
          :title="'Edit ' + transaction.category"
          @click="emit('edit', transaction)"
        >
          <DIcon name="edit" :size="14" />
        </button>
        <button
          type="button"
          class="p-2 sm:p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 active:scale-95"
          :title="'Hapus ' + transaction.category"
          @click="emit('delete', transaction)"
        >
          <DIcon name="trash" :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


import type { Transaction } from '../../domain/entities/Transaction';
import DIcon from '../atoms/DIcon.vue'

interface Props {
  transaction: Transaction
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [transaction: Transaction]
  delete: [transaction: Transaction]
}>()

const formatAmount = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const formatDate = (date: Date): string => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>
