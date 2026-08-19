<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border p-4" :class="borderClass">
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="iconBgClass">
        <svg class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="font-semibold text-slate-800 dark:text-white">{{ insight.title }}</p>
          <span v-if="insight.severity" :class="severityBadgeClass" class="px-2 py-0.5 rounded-full text-xs font-medium">
            {{ insight.severity }}
          </span>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">{{ insight.description }}</p>
        <div v-if="insight.trend" class="flex items-center gap-1 mt-2">
          <svg class="w-4 h-4" :class="trendIconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="trendIconPath" />
          </svg>
          <span class="text-xs font-medium" :class="trendTextClass">{{ trendText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Insight } from '~modules/insights/domain/entities/FinancialInsight'

interface Props { insight: Insight }
const props = defineProps<Props>()

const borderClass = computed(() => {
  if (props.insight.severity === 'critical') return 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10'
  if (props.insight.severity === 'warning') return 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10'
  return 'border-slate-200 dark:border-slate-700'
})

const iconBgClass = computed(() => {
  if (props.insight.severity === 'critical') return 'bg-red-100 dark:bg-red-900/30'
  if (props.insight.severity === 'warning') return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-blue-100 dark:bg-blue-900/30'
})

const iconColorClass = computed(() => {
  if (props.insight.severity === 'critical') return 'text-red-600 dark:text-red-400'
  if (props.insight.severity === 'warning') return 'text-amber-600 dark:text-amber-400'
  return 'text-blue-600 dark:text-blue-400'
})

const iconPath = computed(() => {
  switch (props.insight.type) {
    case 'spending_trend': return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    case 'top_category': return 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
    case 'savings_rate': return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'budget_performance': return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
})

const severityBadgeClass = computed(() => {
  if (props.insight.severity === 'critical') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  if (props.insight.severity === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
})

const trendIconClass = computed(() => {
  if (props.insight.trend === 'up') return 'text-red-500'
  if (props.insight.trend === 'down') return 'text-emerald-500'
  return 'text-slate-400'
})

const trendIconPath = computed(() => {
  if (props.insight.trend === 'up') return 'M5 10l7-7m0 0l7 7m-7-7v18'
  if (props.insight.trend === 'down') return 'M19 14l-7 7m0 0l-7-7m7 7V3'
  return 'M5 12h14'
})

const trendTextClass = computed(() => {
  if (props.insight.trend === 'up') return 'text-red-600 dark:text-red-400'
  if (props.insight.trend === 'down') return 'text-emerald-600 dark:text-emerald-400'
  return 'text-slate-500'
})

const trendText = computed(() => {
  if (props.insight.trend === 'up') return 'Increasing'
  if (props.insight.trend === 'down') return 'Decreasing'
  return 'Stable'
})
</script>
