<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="transaction.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'"
        >
          <svg class="w-5 h-5" :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="transaction.type === 'income' ? 'M12 4v16m8-8H4' : 'M20 12H4'" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-slate-800 dark:text-white">{{ transaction.category }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ frequencyLabel }} • Next: {{ formatDate(transaction.nextDate) }}
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold" :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
          {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
        </p>
        <label class="relative inline-flex items-center cursor-pointer mt-1">
          <input type="checkbox" :checked="transaction.isActive" @change="toggleActive" class="sr-only peer">
          <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    </div>
    <div v-if="transaction.note" class="mt-2 text-sm text-slate-500 dark:text-slate-400">
      {{ transaction.note }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecurringTransaction } from '~modules/recurring/domain/entities/RecurringTransaction'

interface Props {
  transaction: RecurringTransaction
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggleActive: [id: string, isActive: boolean]
}>()

const frequencyLabel = computed(() => {
  const labels: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }
  return labels[props.transaction.frequency] || props.transaction.frequency
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(date))
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

const toggleActive = () => {
  emit('toggleActive', props.transaction.id, !props.transaction.isActive)
}
</script>
