<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 pb-20 transition-colors">
    <div class="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Riwayat Transaksi"
        subtitle="Lihat dan kelola semua transaksi Anda"
        icon="📋"
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

      <!-- Period Selector & Quick Actions -->
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

      <!-- Transaction List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Semua Transaksi</h2>
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ transactions.length }} transaksi
            </span>
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

    <!-- Floating Action Button -->
    <DFloatingActionButton to="/transactions/add" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { GetTransactionsByPeriodUseCase } from '~modules/transactions/application/use-cases/GetTransactionsByPeriodUseCase'
import { ExportTransactionsUseCase } from '~modules/transactions/application/use-cases/ExportTransactionsUseCase'
import type { Transaction, ExportFormat } from '~modules/transactions/domain/entities/Transaction'
import type { PeriodValue } from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
import { downloadFile } from '~shared/utils/downloadFile'
import DTransactionList from '~modules/transactions/ui/organisms/DTransactionList.vue'
import DPeriodSelector from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DSummaryCards from '~shared/ui/molecules/DSummaryCards.vue'
import DSummaryCardsSkeleton from '~shared/ui/molecules/DSummaryCardsSkeleton.vue'
import DActionsMenu from '~shared/ui/molecules/DActionsMenu.vue'
import DBotLinkDialog from '~shared/ui/molecules/DBotLinkDialog.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DFloatingActionButton from '~shared/ui/atoms/DFloatingActionButton.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useToast } from '~~/src/shared/composables/useToast'
import { useBotLink } from '~shared/composables/useBotLink'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useConfirm } from '~shared/composables/useConfirm'
import { useTransactionRealtime } from '~shared/composables/useTransactionRealtime'

// Add auth middleware
definePageMeta({
  middleware: [
    async function (to, from) {
      if (process.server) {
        return
      }

      try {
        const { user, init } = useAuth()

        if (!user.value) {
          await init()
        }

        if (!user.value) {
          return navigateTo('/login')
        }
      } catch (error) {
        console.error('Auth middleware error:', error)
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

// Bot linking
const {
  isGeneratingToken,
  linkToken,
  error: botLinkError,
  generateLinkToken,
  copyTokenToClipboard,
  getTimeRemaining
} = useBotLink()

const showBotLinkDialog = ref(false)
const botTokenTimeRemaining = computed(() => getTimeRemaining())

const transactions = ref<Transaction[]>([])
const selectedPeriod = ref('this-month')
const currentPeriod = ref<PeriodValue>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59),
})
const isLoading = ref(false)

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
    console.error('Failed to load transactions:', error)
  } finally {
    isLoading.value = false
  }
}

const handlePeriodChange = async (period: PeriodValue) => {
  currentPeriod.value = period
  await loadTransactions()
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
    transactions.value = transactions.value.filter(t => t.id !== transaction.id)
    toast.success('Transaksi berhasil dihapus')
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    toast.error('Gagal menghapus transaksi')
  }
}

const handleExport = async (format: ExportFormat) => {
  try {
    const useCase = new ExportTransactionsUseCase()
    const result = await useCase.execute({
      transactions: transactions.value,
      format
    })

    downloadFile(result.content, result.filename, result.mimeType)
    toast.success('Transaksi berhasil diekspor')
  } catch (error) {
    console.error('Failed to export transactions:', error)
    toast.error('Gagal mengekspor transaksi')
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
    toast.success('Link token berhasil dibuat')
  } else {
    toast.error(result.error || 'Gagal membuat link token')
  }
}

async function handleCopyToken() {
  const success = await copyTokenToClipboard()
  if (success) {
    toast.success('Token berhasil disalin')
  } else {
    toast.error('Gagal menyalin token')
  }
}

onMounted(async () => {
  await loadTransactions()

  // Setup realtime subscription for transactions
  if (user.value?.id) {
    subscribeToTransactions(user.value.id, {
      onInsert: async () => {
        await loadTransactions()
      },
      onUpdate: async () => {
        await loadTransactions()
      },
      onDelete: async () => {
        await loadTransactions()
      }
    })
  }
})
</script>
