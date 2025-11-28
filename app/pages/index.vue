<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
    <div class="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <!-- Page Header -->
      <DPageHeader
        title="Dompetku"
        subtitle="Kelola keuangan dengan mudah"
        icon="💰"
        :user-email="user?.email"
        @logout="handleLogout"
      >
        <template #notification>
          <DNotificationBell />
        </template>
        <template #dark-mode-toggle>
          <DDarkModeToggle :is-dark="isDark" @toggle="toggleDarkMode" />
        </template>
      </DPageHeader>

      <!-- Quick Actions & Period Selector -->
      <div class="mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <DActionsMenu
          @export="handleExport"
          @manage-categories="router.push('/categories')"
          @link-bot="openBotLinkDialog"
        />

        <DPeriodSelector
          v-model="selectedPeriod"
          @change="handlePeriodChange"
        />
      </div>

      <!-- Summary Cards -->
      <DSummaryCardsSkeleton v-if="isLoading" class="mb-6" />
      <DSummaryCards v-else :summary="summary" class="mb-6" />

      <!-- Analytics Section -->
      <div class="mb-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DAnalyticsCardSkeleton v-if="isLoadingAnalytics" />
        <DAnalyticsCard
          v-else
          :summary="analyticsSummary"
          title="Analisis Keuangan"
        />
      </div>

      <!-- Transaction Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
        <div class="flex items-center gap-2.5 mb-5">
          <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi' }}
          </h2>
        </div>
        <DTransactionForm
          :mode="editingTransaction ? 'edit' : 'create'"
          :transaction="editingTransaction || undefined"
          :loading="isSubmitting"
          @submit="handleSubmitTransaction"
          @cancel="handleCancelEdit"
        />
      </div>

      <!-- Transaction List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h2>
          </div>
        </div>
        <DTransactionList
          :transactions="transactions"
          :loading="isLoading"
          @edit="handleEditTransaction"
          @delete="handleDeleteTransaction"
        />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { AddTransactionUseCase } from '~modules/transactions/application/use-cases/AddTransactionUseCase'
import { UpdateTransactionUseCase } from '~modules/transactions/application/use-cases/UpdateTransactionUseCase'
import { GetTransactionsByPeriodUseCase } from '~modules/transactions/application/use-cases/GetTransactionsByPeriodUseCase'
import { ExportTransactionsUseCase } from '~modules/transactions/application/use-cases/ExportTransactionsUseCase'
import { GetCategoryAnalyticsUseCase } from '~modules/analytics/application/use-cases/GetCategoryAnalyticsUseCase'
import type { Transaction, TransactionType, ExportFormat } from '~modules/transactions/domain/entities/Transaction'
import type { AnalyticsSummary } from '~modules/analytics/domain/entities/CategoryAnalytics'
import { downloadFile } from '~shared/utils/downloadFile'
import DTransactionForm from '~modules/transactions/ui/organisms/DTransactionForm.vue'
import DTransactionList from '~modules/transactions/ui/organisms/DTransactionList.vue'
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
import type { PeriodValue } from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useToast } from '~~/src/shared/composables/useToast'
import { useBotLink } from '~shared/composables/useBotLink'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useConfirm } from '~shared/composables/useConfirm'
import { useTransactionRealtime } from '~shared/composables/useTransactionRealtime'
import { useNotifications } from '~shared/composables/useNotifications'




// Add auth middleware
definePageMeta({
  middleware: [
    async function (to, from) {
      const { user, init } = useAuth()

      // Initialize auth session if not already loaded
      if (!user.value) {
        await init()
      }

      // Check if user is authenticated
      if (!user.value) {
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
const { subscribe: subscribeToTransactions, unsubscribe: unsubscribeFromTransactions } = useTransactionRealtime()
const { addNotification } = useNotifications()

// Bot linking
const {
  isGeneratingToken,
  linkToken,
  tokenExpiresAt,
  error: botLinkError,
  generateLinkToken,
  resetLinkToken,
  copyTokenToClipboard,
  getTimeRemaining
} = useBotLink()

const showBotLinkDialog = ref(false)
const botTokenTimeRemaining = computed(() => getTimeRemaining())

const transactions = ref<Transaction[]>([])
const analyticsSummary = ref<AnalyticsSummary | null>(null)
const selectedPeriod = ref('this-month')
const currentPeriod = ref<PeriodValue>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59),
})
const isLoading = ref(false)
const isSubmitting = ref(false)
const isLoadingAnalytics = ref(false)
const editingTransaction = ref<Transaction | null>(null)

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
    toast.error('Failed to load transactions')
    console.error('Failed to load transactions:', error)
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
    toast.error('Failed to load analytics')
    console.error('Failed to load analytics:', error)
  } finally {
    isLoadingAnalytics.value = false
  }
}

const handlePeriodChange = async (period: PeriodValue) => {
  currentPeriod.value = period
  await Promise.all([loadTransactions(), loadAnalytics()])
}

const handleLogout = async () => {
  const confirmed = await confirm.warning(
    'Keluar dari Akun',
    'Apakah Anda yakin ingin keluar dari akun? Anda perlu login kembali untuk mengakses aplikasi.',
    'Ya, Keluar',
    'Batal'
  )

  if (!confirmed) return

  const result = await logout()
  if (result.success) {
    await router.push('/login')
  }
}

const handleSubmitTransaction = async (data: {
  type: TransactionType
  amount: number
  category: string
  categoryId?: string
  note?: string
}) => {
  if (editingTransaction.value) {
    await handleUpdateTransaction(data)
  } else {
    await handleAddTransaction(data)
  }
}

const handleAddTransaction = async (data: {
  type: TransactionType
  amount: number
  category: string
  categoryId?: string
  note?: string
}) => {
  if (!user.value?.id) return

  isSubmitting.value = true
  try {
    const useCase = new AddTransactionUseCase(transactionRepository)
    const newTransaction = await useCase.execute({
      userId: user.value.id,
      ...data
    })

    transactions.value = [newTransaction, ...transactions.value]
    // Reload analytics after adding transaction
    await loadAnalytics()
  } catch (error) {
    console.error('Failed to add transaction:', error)
    toast.error('Failed to add transaction')
  } finally {
    isSubmitting.value = false
  }
}

const handleEditTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleUpdateTransaction = async (data: {
  type: TransactionType
  amount: number
  category: string
  categoryId?: string
  note?: string
}) => {
  if (!user.value?.id || !editingTransaction.value) return

  isSubmitting.value = true
  try {
    const useCase = new UpdateTransactionUseCase(transactionRepository)
    await useCase.execute({
      id: editingTransaction.value.id,
      userId: user.value.id,
      ...data
    })

    // Update transaction in list
    const index = transactions.value.findIndex(t => t.id === editingTransaction.value!.id)
    if (index !== -1) {
      const existingTransaction = transactions.value[index]
      transactions.value[index] = {
        id: existingTransaction?.id as string,
        userId: existingTransaction?.userId as string,
        createdAt: existingTransaction?.createdAt as Date,
        ...data
      }
    }

    // Clear editing state
    editingTransaction.value = null

    // Reload analytics after updating transaction
    await loadAnalytics()
  } catch (error) {
    console.error('Failed to update transaction:', error)
    toast.error('Failed to update transaction')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancelEdit = () => {
  editingTransaction.value = null
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
    transactions.value = transactions.value.filter(t => t.id !== transaction.id)

    // Clear editing state if deleting the transaction being edited
    if (editingTransaction.value?.id === transaction.id) {
      editingTransaction.value = null
    }

    // Reload analytics after deleting transaction
    await loadAnalytics()
    toast.success('Transaksi berhasil dihapus')
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    toast.error('Failed to delete transaction')
  }
}

const handleExport = (format: ExportFormat) => {
  try {
    const useCase = new ExportTransactionsUseCase()
    const result = useCase.execute({
      transactions: transactions.value,
      format
    })

    downloadFile(result.content, result.filename, result.mimeType)
  } catch (error) {
    console.error('Failed to export transactions:', error)
    toast.error('Failed to export transactions')
  }
}

// Bot linking handlers
async function openBotLinkDialog() {
  showBotLinkDialog.value = true
  await handleGenerateLinkToken()
}

async function handleGenerateLinkToken() {
  const result = await generateLinkToken()
  if (result.success) {
    toast.success('Link token generated successfully')
  } else {
    toast.error(result.error || 'Failed to generate link token')
  }
}

async function handleCopyToken() {
  const success = await copyTokenToClipboard()
  if (success) {
    toast.success('Token copied to clipboard')
  } else {
    toast.error('Failed to copy token')
  }
}

onMounted(async () => {
  await Promise.all([loadTransactions(), loadAnalytics()])

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
      onUpdate: async (payload) => {
        // Reload data when transaction is updated
        await Promise.all([loadTransactions(), loadAnalytics()])
      },
      onDelete: async (payload) => {
        // Reload data when transaction is deleted
        await Promise.all([loadTransactions(), loadAnalytics()])
      }
    })
  }
})
</script>
