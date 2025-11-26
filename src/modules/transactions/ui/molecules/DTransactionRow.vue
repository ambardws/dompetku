<template>
  <div
    class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all duration-200 group"
  >
    <div class="flex items-center gap-4 flex-1">
      <div
        :class="[
          'w-12 h-12 rounded-lg flex items-center justify-center',
          transaction.type === 'income'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800'
        ]"
      >
        <DIcon
          :name="transaction.type === 'income' ? 'plus' : 'minus'"
          :size="20"
          :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 dark:text-white truncate">
          {{ transaction.category }}
        </p>
        <p v-if="transaction.note" class="text-sm text-gray-500 dark:text-gray-400 truncate">
          {{ transaction.note }}
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {{ formatDate(transaction.createdAt) }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="text-right">
        <p
          :class="[
            'font-bold text-base',
            transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          ]"
        >
          {{ transaction.type === 'income' ? '+' : '-' }}Rp {{ formatAmount(transaction.amount) }}
        </p>
      </div>

      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button
          type="button"
          class="p-2.5 rounded-xl text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-110"
          @click="emit('edit', transaction)"
        >
          <DIcon name="edit" :size="16" />
        </button>
        <button
          type="button"
          class="p-2.5 rounded-xl text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110"
          @click="emit('delete', transaction)"
        >
          <DIcon name="trash" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'
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
