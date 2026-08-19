<template>
  <div class="space-y-4">
    <!-- Empty State -->
    <div v-if="!loading && recurrings.length === 0" class="text-center py-12">
      <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <p class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No Recurring Transactions</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">Set up automatic transactions for regular expenses or income</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse" />
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <DRecurringCard
        v-for="recurring in recurrings"
        :key="recurring.id"
        :transaction="recurring"
        @toggle-active="handleToggleActive"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecurringTransaction } from '~/modules/recurring/domain/entities/RecurringTransaction'
import DRecurringCard from '../molecules/DRecurringCard.vue'

interface Props {
  recurrings: RecurringTransaction[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { loading: false })
const emit = defineEmits<{
  toggleActive: [id: string, isActive: boolean]
  loadMore: []
}>()

const handleToggleActive = (id: string, isActive: boolean) => {
  emit('toggleActive', id, isActive)
}
</script>
