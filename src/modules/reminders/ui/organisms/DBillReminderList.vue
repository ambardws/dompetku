<template>
  <div class="space-y-4">
    <div v-if="!loading && reminders.length === 0" class="text-center py-12">
      <div class="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <p class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No Bill Reminders</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">Never miss a payment again</p>
    </div>

    <div v-else-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse" />
    </div>

    <div v-else class="space-y-3">
      <DBillReminderCard
        v-for="reminder in reminders"
        :key="reminder.id"
        :reminder="reminder"
        @toggle-active="handleToggleActive"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BillReminder } from '~modules/reminders/domain/entities/BillReminder'
import DBillReminderCard from '../molecules/DBillReminderCard.vue'

interface Props { reminders: BillReminder[]; loading?: boolean }
const props = withDefaults(defineProps<Props>(), { loading: false })
const emit = defineEmits<{ toggleActive: [id: string, isActive: boolean] }>()

const handleToggleActive = (id: string, isActive: boolean) => emit('toggleActive', id, isActive)
</script>
