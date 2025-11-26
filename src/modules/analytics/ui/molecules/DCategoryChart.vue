<template>
  <div class="category-chart">
    <!-- Chart Container -->
    <div class="relative flex items-center justify-center">
      <!-- SVG Donut Chart -->
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 200 200"
        class="transform -rotate-90"
      >
        <circle
          cx="100"
          cy="100"
          :r="radius"
          fill="none"
          stroke="#f3f4f6"
          :stroke-width="strokeWidth"
        />

        <circle
          v-for="(segment, index) in segments"
          :key="index"
          cx="100"
          cy="100"
          :r="radius"
          fill="none"
          :stroke="segment.color"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${segment.length} ${circumference}`"
          :stroke-dashoffset="segment.offset"
          class="transition-all duration-300 hover:opacity-80 cursor-pointer"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
        />
      </svg>

      <!-- Center Label -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <p class="text-sm text-gray-500 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">
          {{ formatAmount(totalAmount) }}
        </p>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 space-y-2">
      <div
        v-for="(item, index) in categories"
        :key="index"
        class="flex items-center justify-between p-3 rounded-lg transition-all"
        :class="hoveredIndex === index ? 'bg-gray-50 scale-105' : 'hover:bg-gray-50'"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <div class="flex items-center gap-3 flex-1">
          <div
            class="w-4 h-4 rounded-full flex-shrink-0"
            :style="{ backgroundColor: item.categoryColor }"
          />
          <span class="text-lg">{{ item.categoryIcon }}</span>
          <span class="text-sm font-medium text-gray-700">
            {{ item.categoryName }}
          </span>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold text-gray-900">
            Rp {{ formatAmount(item.totalAmount) }}
          </p>
          <p class="text-xs text-gray-500">{{ item.percentage }}%</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="text-center py-8">
        <p class="text-gray-400 text-sm">Belum ada data</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CategoryAnalytics } from '~modules/analytics/domain/entities/CategoryAnalytics'

interface Props {
  categories: CategoryAnalytics[]
  title?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Total',
  size: 200,
})

const hoveredIndex = ref<number | null>(null)

// Chart configuration
const strokeWidth = 30
const radius = 85
const circumference = 2 * Math.PI * radius

const totalAmount = computed(() => {
  return props.categories.reduce((sum, cat) => sum + cat.totalAmount, 0)
})

interface Segment {
  color: string
  length: number
  offset: number
}

const segments = computed<Segment[]>(() => {
  let currentOffset = 0

  return props.categories.map((cat) => {
    const percentage = totalAmount.value > 0 ? cat.totalAmount / totalAmount.value : 0
    const length = circumference * percentage
    const offset = -currentOffset

    currentOffset += length

    return {
      color: cat.categoryColor,
      length,
      offset,
    }
  })
})

const formatAmount = (amount: number): string => {
  return Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.category-chart {
  @apply w-full;
}

circle {
  transition: stroke-dashoffset 0.3s ease, opacity 0.3s ease;
}
</style>
