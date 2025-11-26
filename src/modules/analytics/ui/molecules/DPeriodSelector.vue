<template>
  <div class="period-selector">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="selectPeriod(period)"
        class="period-btn"
        :class="modelValue === period.value ? 'active' : ''"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Custom Date Range (Optional Future Enhancement) -->
    <div v-if="showCustomRange" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Range</p>
      <div class="grid grid-cols-2 gap-3">
        <input
          v-model="customFrom"
          type="date"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          v-model="customTo"
          type="date"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        @click="applyCustomRange"
        class="mt-2 w-full px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface PeriodValue {
  from: Date
  to: Date
}

export interface Period {
  label: string
  value: string
  from: Date
  to: Date
}

interface Props {
  modelValue?: string
  showCustomRange?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', period: PeriodValue): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'this-month',
  showCustomRange: false,
})

const emit = defineEmits<Emits>()

const customFrom = ref('')
const customTo = ref('')

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()

const periods = computed<Period[]>(() => [
  {
    label: 'Bulan Ini',
    value: 'this-month',
    from: new Date(currentYear, currentMonth, 1),
    to: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
  },
  {
    label: 'Bulan Lalu',
    value: 'last-month',
    from: new Date(currentYear, currentMonth - 1, 1),
    to: new Date(currentYear, currentMonth, 0, 23, 59, 59),
  },
  {
    label: '3 Bulan Terakhir',
    value: 'last-3-months',
    from: new Date(currentYear, currentMonth - 2, 1),
    to: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
  },
  {
    label: '6 Bulan Terakhir',
    value: 'last-6-months',
    from: new Date(currentYear, currentMonth - 5, 1),
    to: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
  },
  {
    label: 'Tahun Ini',
    value: 'this-year',
    from: new Date(currentYear, 0, 1),
    to: new Date(currentYear, 11, 31, 23, 59, 59),
  },
  {
    label: 'Tahun Lalu',
    value: 'last-year',
    from: new Date(currentYear - 1, 0, 1),
    to: new Date(currentYear - 1, 11, 31, 23, 59, 59),
  },
])

const selectPeriod = (period: Period) => {
  emit('update:modelValue', period.value)
  emit('change', {
    from: period.from,
    to: period.to,
  })
}

const applyCustomRange = () => {
  if (!customFrom.value || !customTo.value) {
    alert('Please select both from and to dates')
    return
  }

  const from = new Date(customFrom.value)
  const to = new Date(customTo.value)
  to.setHours(23, 59, 59)

  if (from >= to) {
    alert('From date must be before To date')
    return
  }

  emit('update:modelValue', 'custom')
  emit('change', { from, to })
}
</script>

<style scoped>
.period-selector {
  @apply w-full;
}

.period-btn {
  @apply px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg;
  @apply hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all;
}

.period-btn.active {
  @apply bg-gray-900 dark:bg-primary-600 text-white border-gray-900 dark:border-primary-600;
  @apply hover:bg-gray-800 dark:hover:bg-primary-700 hover:border-gray-800 dark:hover:border-primary-700;
}
</style>
