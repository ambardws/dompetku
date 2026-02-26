<template>
  <div class="grid grid-cols-1 min-[640px]:grid-cols-3 gap-4">
    <!-- Balance Card -->
    <DSummaryCard
      label="Balance"
      :value="summary.balance"
      variant="balance"
      subtitle="Balance"
    >
      <template #icon>
        <svg class="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </template>
    </DSummaryCard>

    <!-- Income Card -->
    <DSummaryCard
      label="Income"
      :value="summary.income"
      variant="income"
      subtitle="Income"
    >
      <template #icon>
        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      </template>
    </DSummaryCard>

    <!-- Expense Card -->
    <DSummaryCard
      label="Expense"
      :value="summary.expense"
      variant="expense"
      subtitle="Expense"
    >
      <template #icon>
        <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      </template>
    </DSummaryCard>
  </div>
</template>

<script setup lang="ts">
import DSummaryCard from '~shared/ui/atoms/DSummaryCard.vue'

interface SummaryData {
  balance: number
  income: number
  expense: number
}

interface Props {
  summary: SummaryData
}

defineProps<Props>()
</script>
