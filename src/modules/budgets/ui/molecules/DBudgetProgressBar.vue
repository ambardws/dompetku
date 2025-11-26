<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-sm">
      <span class="font-medium text-gray-700">{{ categoryName }}</span>
      <span class="text-gray-600">{{ formatAmount(spent) }} / {{ formatAmount(budget) }}</span>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        :class="[
          'h-full transition-all duration-500 ease-out',
          status === 'safe' ? 'bg-green-500' :
          status === 'warning' ? 'bg-yellow-500' :
          'bg-red-500'
        ]"
        :style="{ width: `${Math.min(percentage, 100)}%` }"
      />
    </div>

    <!-- Status Text -->
    <div class="flex items-center justify-between text-xs">
      <span
        :class="[
          'font-medium',
          status === 'safe' ? 'text-green-600' :
          status === 'warning' ? 'text-yellow-600' :
          'text-red-600'
        ]"
      >
        {{ percentage }}% used
        <span v-if="status === 'warning'"> - Approaching limit!</span>
        <span v-else-if="status === 'exceeded'"> - Budget exceeded!</span>
      </span>
      <span class="text-gray-500">{{ formatAmount(remaining) }} left</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  categoryName: string
  budget: number
  spent: number
  remaining: number
  percentage: number
  status: 'safe' | 'warning' | 'exceeded'
}

defineProps<Props>()

const formatAmount = (amount: number): string => {
  return Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>
