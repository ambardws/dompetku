<template>
  <div class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <!-- Category Icon -->
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          :style="{ backgroundColor: `${category.color}20` }"
        >
          {{ category.icon }}
        </div>

        <!-- Category Info -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white text-base">
            {{ category.name }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Budget: {{ formatCurrency(budget.amount) }}
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <div
        class="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
        :class="statusBadgeClasses"
      >
        <span v-if="budgetStatus.status === 'safe'">✓ Safe</span>
        <span v-else-if="budgetStatus.status === 'warning'">⚠ Caution</span>
        <span v-else>⚠ Over</span>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="mb-3">
      <div class="flex items-center justify-between text-sm mb-2">
        <span class="text-gray-600 dark:text-gray-400">Usage</span>
        <span class="font-medium" :class="statusTextClass">
          {{ budgetStatus.percentage }}%
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="progressBarClass"
          :style="{ width: `${Math.min(budgetStatus.percentage, 100)}%` }"
        />
      </div>

      <!-- Amount Text -->
      <div class="flex items-center justify-between text-xs mt-2">
        <span class="font-medium" :class="statusTextClass">
          {{ formatCurrency(budgetStatus.spent) }}
        </span>
        <span class="text-gray-500 dark:text-gray-400">
          of {{ formatCurrency(budget.amount) }}
        </span>
      </div>
    </div>

    <!-- Status Message -->
    <div
      v-if="budgetStatus.status !== 'safe'"
      class="mb-3 p-2 rounded-lg text-xs"
      :class="statusMessageClass"
    >
      <span v-if="budgetStatus.status === 'warning'">
        ⚠️ Expenses have reached {{ budgetStatus.percentage }}%. Consider saving more.
      </span>
      <span v-else>
        ⚠️ Budget exceeded by {{ budgetStatus.percentage - 100 }}%. Reduce expenses for this category.
      </span>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
      <DButton
        size="sm"
        variant="secondary"
        @click="$emit('edit')"
        class="flex-1"
      >
        <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2h2.828l-2.828-2.828z" />
        </svg>
        Edit
      </DButton>
      <DButton
        size="sm"
        variant="danger-ghost"
        @click="handleDelete"
        class="px-3"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
        </svg>
      </DButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '~modules/categories/domain/entities/Category'
import type { Budget, BudgetStatus } from '~modules/budgets/domain/entities/Budget'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'

interface Props {
  category: Category
  budget: Budget
  budgetStatus: BudgetStatus
}

interface Emits {
  (e: 'edit'): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleDelete() {
  if (confirm(`Delete budget for ${props.category.name}?`)) {
    emit('delete')
  }
}

const statusBadgeClasses = computed(() => {
  switch (props.budgetStatus.status) {
    case 'safe':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'exceeded':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
})

const progressBarClass = computed(() => {
  switch (props.budgetStatus.status) {
    case 'safe':
      return 'bg-green-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'exceeded':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
})

const statusTextClass = computed(() => {
  switch (props.budgetStatus.status) {
    case 'safe':
      return 'text-green-600 dark:text-green-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'exceeded':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
})

const statusMessageClass = computed(() => {
  switch (props.budgetStatus.status) {
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
    case 'exceeded':
      return 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
    default:
      return ''
  }
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>
