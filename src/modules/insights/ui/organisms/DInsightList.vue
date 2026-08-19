<template>
  <div class="space-y-4">
    <div v-if="!loading && insights.length === 0" class="text-center py-12">
      <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No Insights Yet</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">Start tracking your finances to get personalized insights</p>
    </div>

    <div v-else-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse" />
    </div>

    <DInsightCard v-for="(insight, index) in insights" :key="index" :insight="insight" />
  </div>
</template>

<script setup lang="ts">
import type { Insight } from '~modules/insights/domain/entities/FinancialInsight'
import DInsightCard from '../molecules/DInsightCard.vue'

interface Props { insights: Insight[]; loading?: boolean }
withDefaults(defineProps<Props>(), { loading: false })
</script>
