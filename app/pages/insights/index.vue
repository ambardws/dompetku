<template>
  <div class="bg-gray-100 dark:bg-gray-950 pb-16 transition-colors">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Financial Insights"
        subtitle="AI-powered financial analysis"
        icon="lightbulb"
        :show-back-button="true"
        :user-email="user?.email"
        @back="handleBack"
      >
        <template #actions-menu>
          <DActionsMenu
            :show-export="false"
            @manage-categories="router.push('/categories')"
            @manage-budgets="router.push('/budgets')"
            @link-bot="() => {}"
            @logout="handleLogout"
          />
        </template>
        <template #notification>
          <DNotificationBell />
        </template>
        <template #dark-mode-toggle>
          <DDarkModeToggle :is-dark="isDark" @toggle="toggleDarkMode" />
        </template>
      </DPageHeader>

      <!-- Period Selector -->
      <div class="mb-5 flex gap-2">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="[
            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
            selectedPeriod === period.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          ]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>

      <!-- Insights List -->
      <DInsightList :insights="insights" :loading="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Insight, InsightPeriod } from '~modules/insights/domain/entities/FinancialInsight'
import { useAuth } from '~shared/composables/useAuth'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { GetFinancialInsightsUseCase } from '~modules/insights/application/use-cases/GetFinancialInsightsUseCase'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useSharedHeader } from '~shared/composables/useSharedHeader'
import DInsightList from '~modules/insights/ui/organisms/DInsightList.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DActionsMenu from '~shared/ui/molecules/DActionsMenu.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'

definePageMeta({
  middleware: [
    async function (to, from) {
      if (process.server) return
      try {
        const { user, init } = useAuth()
        if (!user.value) await init()
        if (!user.value) return navigateTo('/login')
      } catch (error) {
        return navigateTo('/login')
      }
    }
  ]
})

const router = useRouter()
const { user } = useAuth()
const { repository: transactionRepository } = useTransactionRepository()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const { handleLogout } = useSharedHeader()

const insights = ref<Insight[]>([])
const loading = ref(false)
const selectedPeriod = ref<InsightPeriod>('current_month')

const periods = [
  { value: 'current_month' as InsightPeriod, label: 'This Month' },
  { value: 'last_3_months' as InsightPeriod, label: '3 Months' },
  { value: 'last_6_months' as InsightPeriod, label: '6 Months' }
]

const handleBack = () => router.push('/')

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
