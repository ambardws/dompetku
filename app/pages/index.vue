<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 pb-20 transition-colors">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8">
      <!-- Page Header -->
      <DPageHeader
        title="Dompetku"
        subtitle="Kelola keuangan dengan mudah"
        icon="💰"
        :user-email="user?.email"
      >
        <template #actions-menu>
          <DActionsMenu
            @export="(format) => handleExport(transactions, format)"
            @manage-categories="router.push('/categories')"
            @link-bot="openBotLinkDialog"
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
      <div class="mb-5 flex">
        <DPeriodSelector
          v-model="currentPeriod"
        />
      </div>

      <!-- Summary Cards -->
      <DSummaryCardsSkeleton v-if="isLoading" class="mb-6" />
      <DSummaryCards v-else :summary="summary" class="mb-6" />

      <!-- Analytics Section -->
      <div class="mb-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ClientOnly>
          <template #fallback>
            <DAnalyticsCardSkeleton />
          </template>
          <DAnalyticsCardSkeleton v-if="isLoadingAnalytics" />
          <DAnalyticsCard
            v-else
            :summary="analyticsSummary"
            title="Analisis Keuangan"
          />
        </ClientOnly>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Transaksi Terbaru</h2>
            </div>
            <NuxtLink
              to="/transactions"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 dark:hover:bg-blue-600 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              Lihat Semua
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
        <ClientOnly>
          <template #fallback>
            <DTransactionListSkeleton />
          </template>
          <DTransactionList
            :transactions="recentTransactions"
            :loading="isLoading"
            @edit="handleEditTransaction"
            @delete="handleDeleteTransaction"
          />
        </ClientOnly>
        <div v-if="!isLoading && recentTransactions.length === 0" class="px-5 py-8 text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-3">Belum ada transaksi</p>
          <button
            @click="router.push('/transactions/add')"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Transaksi
          </button>
        </div>
      </div>
    </div>

    <!-- Bot Link Dialog -->
    <DBotLinkDialog
      v-model="showBotLinkDialog"
      :token="linkToken"
      :is-generating="isGeneratingToken"
      :error="botLinkError"
      :time-remaining="botTokenTimeRemaining"
      @retry="handleGenerateLinkToken"
      @copy="handleCopyToken"
    />

    <!-- Floating Action Button -->
    <DFloatingActionButton to="/transactions/add" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { GetTransactionsByPeriodUseCase } from '~modules/transactions/application/use-cases/GetTransactionsByPeriodUseCase'
import { GetCategoryAnalyticsUseCase } from '~modules/analytics/application/use-cases/GetCategoryAnalyticsUseCase'
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'
import type { AnalyticsSummary } from '~modules/analytics/domain/entities/CategoryAnalytics'
import type { PeriodValue } from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
import DTransactionList from '~modules/transactions/ui/organisms/DTransactionList.vue'
import DTransactionListSkeleton from '~modules/transactions/ui/organisms/DTransactionListSkeleton.vue'
import DAnalyticsCard from '~modules/analytics/ui/organisms/DAnalyticsCard.vue'
import DPeriodSelector from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DSummaryCards from '~shared/ui/molecules/DSummaryCards.vue'
import DSummaryCardsSkeleton from '~shared/ui/molecules/DSummaryCardsSkeleton.vue'
import DAnalyticsCardSkeleton from '~shared/ui/organisms/DAnalyticsCardSkeleton.vue'
import DActionsMenu from '~shared/ui/molecules/DActionsMenu.vue'
import DBotLinkDialog from '~shared/ui/molecules/DBotLinkDialog.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DFloatingActionButton from '~shared/ui/atoms/DFloatingActionButton.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useToast } from '~~/src/shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useConfirm } from '~shared/composables/useConfirm'
import { useTransactionRealtime } from '~shared/composables/useTransactionRealtime'
import { useNotifications } from '~shared/composables/useNotifications'
import { useSharedHeader } from '~shared/composables/useSharedHeader'
import { useHeaderActions } from '~shared/composables/useHeaderActions'

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

const { user, logout } = useAuth()
const transactionRepository = useTransactionRepository()
const categoryRepository = useCategoryRepository()
const router = useRouter()
const toast = useToast()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const confirm = useConfirm()
const { subscribe: subscribeToTransactions } = useTransactionRealtime()
const { addNotification } = useNotifications()
const { handleLogout } = useSharedHeader()

// Header actions (export, bot link)
const {
  showBotLinkDialog,
  isGeneratingToken,
  linkToken,
  botLinkError,
  botTokenTimeRemaining,
  handleExport,
  openBotLinkDialog,
  handleGenerateLinkToken,
  handleCopyToken
} = useHeaderActions()

const transactions = ref<Transaction[]>([])
const analyticsSummary = ref<AnalyticsSummary | null>(null)
const currentPeriod = ref<PeriodValue>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1st of this month
  to: new Date(), // Today
})
const isLoading = ref(false)
const isLoadingAnalytics = ref(false)

// Watch for period changes and reload data
watch(currentPeriod, async () => {
  await Promise.all([loadTransactions(), loadAnalytics()])
}, { deep: true })

// Show only recent 5 transactions on dashboard
const recentTransactions = computed(() => {
  return transactions.value.slice(0, 5)
})

const summary = computed(() => {
  const income = transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expense,
    balance: income - expense
  }
})

const formatAmount = (amount: number): string => {
  return Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const loadTransactions = async () => {
  if (!user.value?.id) return

  isLoading.value = true
  try {
    const useCase = new GetTransactionsByPeriodUseCase(transactionRepository)

    transactions.value = await useCase.execute({
      userId: user.value.id,
      from: currentPeriod.value.from,
      to: currentPeriod.value.to
    })
  } catch (error) {
    toast.error('Gagal memuat transaksi')
  } finally {
    isLoading.value = false
  }
}

const loadAnalytics = async () => {
  if (!user.value?.id) return

  isLoadingAnalytics.value = true
  try {
    const useCase = new GetCategoryAnalyticsUseCase(transactionRepository, categoryRepository)

    analyticsSummary.value = await useCase.execute({
      userId: user.value.id,
      from: currentPeriod.value.from,
      to: currentPeriod.value.to
    })
  } catch (error) {
    toast.error('Gagal memuat analisis')
  } finally {
    isLoadingAnalytics.value = false
  }
}

const handleEditTransaction = (transaction: Transaction) => {
  router.push(`/transactions/add?edit=${transaction.id}`)
}

const handleDeleteTransaction = async (transaction: Transaction) => {
  const confirmed = await confirm.danger(
    'Hapus Transaksi',
    `Apakah Anda yakin ingin menghapus transaksi ${transaction.type === 'income' ? 'pemasukan' : 'pengeluaran'} sebesar Rp ${formatAmount(transaction.amount)}? Tindakan ini tidak dapat dibatalkan.`,
    'Ya, Hapus',
    'Batal'
  )

  if (!confirmed) return

  try {
    await transactionRepository.delete(transaction.id)
    await Promise.all([loadTransactions(), loadAnalytics()])
    toast.success('Transaksi berhasil dihapus')
  } catch (error) {
    toast.error('Gagal menghapus transaksi')
  }
}

onMounted(async () => {
  if (user.value) {
    await Promise.all([loadTransactions(), loadAnalytics()])
  }

  // Setup realtime subscription for transactions
  if (user.value?.id) {
    subscribeToTransactions(user.value.id, {
      onInsert: async (payload) => {
        // Show notification for new transaction
        const amount = payload.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        const typeText = payload.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
        const emoji = payload.type === 'income' ? '💰' : '💸'
        const category = payload.category

        // Show toast notification
        toast.success(`${emoji} ${typeText} baru: Rp ${amount}`)

        // Add to notification center
        addNotification({
          title: `${typeText} Baru`,
          message: `${category} - Rp ${amount}`,
          type: 'success',
          icon: emoji
        })

        // Reload data to get the latest transactions
        await Promise.all([loadTransactions(), loadAnalytics()])
      },
      onUpdate: async () => {
        // Reload data when transaction is updated
        await Promise.all([loadTransactions(), loadAnalytics()])
      },
      onDelete: async () => {
        // Reload data when transaction is deleted
        await Promise.all([loadTransactions(), loadAnalytics()])
      }
    })
  }
})

// Watch for user to be available (for initial load if auth takes time)
watch(user, (newUser) => {
  if (newUser) {
    loadTransactions()
    loadAnalytics()
  }
})
</script>
