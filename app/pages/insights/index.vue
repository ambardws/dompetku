<template>
  <NuxtLayout>
    <div class="mb-5">
      <h1 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Financial Insights</h1>

      <!-- Period Selector -->
      <div class="flex gap-2 mb-5">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selectedPeriod === period.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          ]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <DInsightList :insights="insights" :loading="loading" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Insight, InsightPeriod } from '~/modules/insights/domain/entities/FinancialInsight'
import { useAuth } from '~shared/composables/useAuth'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { GetFinancialInsightsUseCase } from '~/modules/insights/application/use-cases/GetFinancialInsightsUseCase'
import DInsightList from '~/modules/insights/ui/organisms/DInsightList.vue'

definePageMeta({ layout: 'default' })

const pageMeta = { title: 'Insights', subtitle: 'AI-powered financial analysis', icon: 'lightbulb', showBackButton: true, showFAB: false }
provide('pageMeta', pageMeta)

const { user } = useAuth()
const { repository: transactionRepository } = useTransactionRepository()

const insights = ref<Insight[]>([])
const loading = ref(false)
const selectedPeriod = ref<InsightPeriod>('current_month')

const periods = [
  { value: 'current_month' as InsightPeriod, label: 'This Month' },
  { value: 'last_3_months' as InsightPeriod, label: '3 Months' },
  { value: 'last_6_months' as InsightPeriod, label: '6 Months' }
]

const loadInsights = async () => {
  if (!user.value?.id) return
  loading.value = true
  try {
    const useCase = new GetFinancialInsightsUseCase(transactionRepository)
    const result = await useCase.execute({ userId: user.value.id, period: selectedPeriod.value })
    insights.value = result.insights
  } catch (e) {
    console.error('Failed to load insights', e)
  } finally {
    loading.value = false
  }
}

watch(selectedPeriod, loadInsights)
onMounted(loadInsights)
</script>
