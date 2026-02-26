<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 pb-20 transition-colors">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Budget"
        subtitle="Atur dan pantau budget pengeluaran Anda"
        icon="💰"
        :user-email="user?.email"
        :show-back-button="true"
        @back="handleBack"
      >
        <template #notification>
          <DNotificationBell />
        </template>
        <template #dark-mode-toggle>
          <DDarkModeToggle :is-dark="isDark" @toggle="toggle" />
        </template>
      </DPageHeader>

      <!-- Period Selector -->
      <div class="mb-5 flex">
        <DPeriodSelector
          v-model="currentPeriod"
        />
      </div>

      <!-- Overall Budget Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5 shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Ringkasan Budget</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Bulan {{ currentMonthName }}</p>
          </div>
        </div>

        <div v-if="isLoadingBudgets" class="animate-pulse">
          <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div class="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>

        <div v-else class="space-y-3">
          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Budget</p>
              <p class="text-base font-bold text-gray-900 dark:text-white">
                {{ formatCurrencyCompact(totalBudget) }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Digunakan</p>
              <p class="text-base font-bold text-gray-900 dark:text-white">
                {{ formatCurrencyCompact(totalSpent) }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Sisa</p>
              <p class="text-base font-bold" :class="totalRemaining >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'">
                {{ formatCurrencyCompact(Math.abs(totalRemaining)) }}
              </p>
            </div>
          </div>

          <!-- Overall Progress -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ overallPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                class="h-full rounded-full transition-all duration-500 bg-blue-500"
                :style="{ width: `${Math.min(overallPercentage, 100)}%` }"
              />
            </div>
            <div v-if="overallPercentage >= 100" class="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ Budget telah terlampaui
            </div>
            <div v-else-if="overallPercentage >= 80" class="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              ⚠️ Hampir mencapai limit budget
            </div>
            <div v-else class="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
              ✅ Penggunaan budget masih aman
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Left: Set Budget Form -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0h-6M6 12h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedBudget ? 'Edit Budget' : 'Set Budget Baru' }}
            </h2>
          </div>

          <DBudgetForm
            :categories="categories"
            :budget="selectedBudget"
            :loading="isSubmitting"
            @submit="handleSubmitBudget"
            @delete="handleDeleteBudget"
          />
        </div>

        <!-- Right: Budget List -->
        <div class="space-y-4">
          <!-- Budgets List Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 002 5m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Daftar Budget
                  </h2>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {{ budgetsWithStatus.length }} budget
                </span>
              </div>
            </div>

            <div class="p-4">
              <!-- Empty State -->
              <div v-if="!isLoadingBudgets && budgetsWithStatus.length === 0" class="text-center py-10">
                <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Belum ada budget
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Atur budget untuk mengontrol pengeluaran bulanan Anda
                </p>
                <div class="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pilih kategori dan masukkan jumlah budget</span>
                </div>
              </div>

              <!-- Loading State -->
              <div v-else-if="isLoadingBudgets" class="space-y-3">
                <div v-for="i in 3" :key="i" class="animate-pulse">
                  <div class="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>

              <!-- Budget List -->
              <div v-else class="space-y-3">
                <DBudgetCard
                  v-for="item in budgetsWithStatus"
                  :key="item.budget.id"
                  :category="item.category"
                  :budget="item.budget"
                  :budget-status="item.budgetStatus"
                  @edit="selectBudget(item.budget)"
                  @delete="handleDeleteBudgetWithId(item.budget.id)"
                />
              </div>
            </div>
          </div>

          <!-- Budget Tips -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Tips Budget
                </h3>
                <p class="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  Atur budget maksimal 50-70% dari pemasukan untuk kategori pengeluaran utama. Sisanya untuk tabungan dan investasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '~shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useAuth } from '~shared/composables/useAuth'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { useBudgetRepository } from '~shared/composables/useBudgetRepository'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { SetBudgetUseCase } from '~modules/budgets/application/use-cases/SetBudgetUseCase'
import { GetBudgetStatusUseCase } from '~modules/budgets/application/use-cases/GetBudgetStatusUseCase'
import type { Budget } from '~modules/budgets/domain/entities/Budget'
import type { Category } from '~modules/categories/domain/entities/Category'
import type { PeriodValue } from '~modules/analytics/ui/molecules/DPeriodSelector.vue'

// Explicit imports for components
import DBudgetForm from '~modules/budgets/ui/molecules/DBudgetForm.vue'
import DBudgetCard from '~modules/budgets/ui/molecules/DBudgetCard.vue'
import DPeriodSelector from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'

// Add auth middleware
definePageMeta({
  middleware: [
    async function (to, from) {
      // Only run on client-side to avoid SSR issues
      if (process.server) {
        return
      }

      try {
        const { user, init } = useAuth()

        // Initialize auth session if not already loaded
        if (!user.value) {
          await init()
        }

        // Check if user is authenticated
        if (!user.value) {
          return navigateTo('/login')
        }
      } catch (error) {
        return navigateTo('/login')
      }
    }
  ]
})

const router = useRouter()
const toast = useToast()
const { isDark, toggle } = useDarkMode()
const { user } = useAuth()

// Repositories
const categoryRepository = useCategoryRepository()
const budgetRepository = useBudgetRepository()
const transactionRepository = useTransactionRepository()

// Use cases
const setBudgetUseCase = new SetBudgetUseCase(budgetRepository)
const getBudgetStatusUseCase = new GetBudgetStatusUseCase(budgetRepository, transactionRepository)

// State
const categories = ref<Category[]>([])
const budgets = ref<Budget[]>([])
const budgetsWithStatus = ref<Array<{
  budget: Budget
  category: Category
  budgetStatus: any
}>>([])
const selectedBudget = ref<Budget | undefined>(undefined)
const isLoadingBudgets = ref(true)
const isSubmitting = ref(false)
const currentPeriod = ref<PeriodValue>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
})

// Computed
const totalBudget = computed(() =>
  budgets.value.reduce((sum, b) => sum + b.amount, 0)
)

const totalSpent = computed(() =>
  budgetsWithStatus.value.reduce((sum, item) => sum + item.budgetStatus.spent, 0)
)

const totalRemaining = computed(() => totalBudget.value - totalSpent.value)

const overallPercentage = computed(() => {
  if (totalBudget.value === 0) return 0
  return Math.round((totalSpent.value / totalBudget.value) * 100)
})

const currentMonthName = computed(() => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[new Date().getMonth()]
})

// Methods
async function loadCategories() {
  try {
    categories.value = await categoryRepository.getByUserId(user.value!.id)
  } catch (error: any) {
    toast.error('Gagal memuat kategori: ' + error.message)
  }
}

async function loadBudgets() {
  if (!user.value) return

  isLoadingBudgets.value = true
  try {
    // Get all budgets
    budgets.value = await budgetRepository.getByUserId(user.value.id)

    // Calculate date range for current month
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get budget status for each budget
    const items = await Promise.all(
      budgets.value.map(async (budget) => {
        // Find category
        const category = categories.value.find(c => c.id === budget.categoryId)
        if (!category) return null

        // Get budget status
        try {
          const budgetStatus = await getBudgetStatusUseCase.execute({
            userId: user.value!.id,
            categoryId: budget.categoryId,
            startDate,
            endDate
          })

          return { budget, category, budgetStatus }
        } catch (error) {
          console.error(`Error getting budget status for ${budget.id}:`, error)
          return null
        }
      })
    )

    budgetsWithStatus.value = items.filter(item => item !== null)
  } catch (error: any) {
    toast.error('Gagal memuat budget: ' + error.message)
  } finally {
    isLoadingBudgets.value = false
  }
}

async function handleSubmitBudget(data: { categoryId: string; amount: number }) {
  if (!user.value) return

  isSubmitting.value = true
  try {
    await setBudgetUseCase.execute({
      userId: user.value.id,
      categoryId: data.categoryId,
      amount: data.amount
    })

    toast.success(selectedBudget.value ? 'Budget berhasil diupdate' : 'Budget berhasil di-set')
    selectedBudget.value = undefined

    // Reload budgets
    await loadBudgets()
  } catch (error: any) {
    toast.error('Gagal menyimpan budget: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteBudget() {
  if (!selectedBudget.value || !user.value) return

  isSubmitting.value = true
  try {
    await budgetRepository.delete(selectedBudget.value.id)
    toast.success('Budget berhasil dihapus')
    selectedBudget.value = undefined
    await loadBudgets()
  } catch (error: any) {
    toast.error('Gagal menghapus budget: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteBudgetWithId(budgetId: string) {
  if (!user.value) return

  try {
    await budgetRepository.delete(budgetId)
    toast.success('Budget berhasil dihapus')
    await loadBudgets()
  } catch (error: any) {
    toast.error('Gagal menghapus budget: ' + error.message)
  }
}

function selectBudget(budget: Budget) {
  selectedBudget.value = budget
}

function handleBack() {
  router.push('/')
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'jt'
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'rb'
  }
  return amount.toString()
}

// Watch for period changes
watch(currentPeriod, () => {
  loadBudgets()
})

// Lifecycle
onMounted(async () => {
  await loadCategories()
  await loadBudgets()
})
</script>
