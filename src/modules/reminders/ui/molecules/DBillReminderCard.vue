<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border p-4" :class="cardClasses">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="iconBgClass">
          <svg class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-slate-800 dark:text-white">{{ reminder.title }}</p>
          <p class="text-sm" :class="dueDateColorClass">
            {{ dueDateText }}
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold text-slate-800 dark:text-white">{{ formatCurrency(reminder.amount) }}</p>
        <label class="relative inline-flex items-center cursor-pointer mt-1">
          <input type="checkbox" :checked="reminder.isActive" @change="toggleActive" class="sr-only peer">
          <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    </div>
    <div v-if="reminder.notes" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ reminder.notes }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BillReminder } from '~modules/reminders/domain/entities/BillReminder'

interface Props { reminder: BillReminder }
const props = defineProps<Props>()
const emit = defineEmits<{ toggleActive: [id: string, isActive: boolean] }>()

const daysUntilDue = computed(() => {
  const today = new Date()
  const due = new Date(props.reminder.nextDueDate)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
})

const dueDateText = computed(() => {
  const days = daysUntilDue.value
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
})

const dueDateColorClass = computed(() => {
  const days = daysUntilDue.value
  if (days < 0) return 'text-red-600 dark:text-red-400 font-semibold'
  if (days <= 3) return 'text-amber-600 dark:text-amber-400'
  return 'text-slate-500 dark:text-slate-400'
})

const cardClasses = computed(() => {
  const days = daysUntilDue.value
  if (days < 0) return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
  if (days <= 3) return 'border-amber-200 dark:border-amber-800'
  return 'border-slate-200 dark:border-slate-700'
})

const iconBgClass = computed(() => {
  const days = daysUntilDue.value
  if (days < 0) return 'bg-red-100 dark:bg-red-900/30'
  if (days <= 3) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-slate-100 dark:bg-slate-700'
})

const iconColorClass = computed(() => {
  const days = daysUntilDue.value
  if (days < 0) return 'text-red-600 dark:text-red-400'
  if (days <= 3) return 'text-amber-600 dark:text-amber-400'
  return 'text-slate-600 dark:text-slate-400'
})

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const toggleActive = () => emit('toggleActive', props.reminder.id, !props.reminder.isActive)
</script>
