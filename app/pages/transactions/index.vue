<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 pb-20 transition-colors">
    <div class="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Riwayat Transaksi"
        subtitle="Lihat dan kelola semua transaksi Anda"
        icon="📋"
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
      <div class="mb-4 flex">
        <DPeriodSelector
          v-model="currentPeriod"
        />
      </div>

      <!-- Summary Cards -->
      <DSummaryCardsSkeleton v-if="isLoading" class="mb-6" />
      <DSummaryCards v-else :summary="summary" class="mb-6" />

      <!-- Transaction List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 002" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Semua Transaksi</h2>
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ allTransactions.length }} transaksi
            </span>
          </div>

          <!-- Category Filter -->
          <DCategoryFilter
            v-model="selectedCategory"
            :categories="categories"
            :loading="isLoadingCategories"
          />
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { GetTransactionsByPeriodUseCase } from '~modules/transactions/application/use-cases/GetTransactionsByPeriodUseCase'
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'
import type { PeriodValue } from '~modules/analytics/ui/molecules/DPeriodSelector.vue'
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
import DCategoryFilter from '~modules/transactions/ui/molecules/DCategoryFilter.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useToast } from '~~/src/shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useConfirm } from '~shared/composables/useConfirm'
import { useTransactionRealtime } from '~shared/composables/useTransactionRealtime'
import type { Category } from '~modules/categories/domain/entities/Category'
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

        if (!user.value) {
          return navigateTo('/login')
        }
      } catch (error) {
        return navigateTo('/login')
      }
    }
  ]
})

const { user } = useAuth()
const transactionRepository = useTransactionRepository()
const categoryRepository = useCategoryRepository()
const router = useRouter()
const toast = useToast()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const confirm = useConfirm()
const { subscribe: subscribeToTransactions } = useTransactionRealtime()
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
const allTransactions = ref<Transaction[]>([])
const currentPeriod = ref<PeriodValue>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
})
const selectedCategory = ref('')
const categories = ref<Category[]>([])
const isLoadingCategories = ref(false)
const isLoading = ref(false)

// Track loaded data to avoid unnecessary API calls
const loadedPeriodKey = ref<string>('')

// Summary based on ALL transactions (not filtered by category)
const summary = computed(() => {
  const income = allTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = allTransactions.value
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

const loadCategories = async () => {
  if (!user.value?.id) return

  isLoadingCategories.value = true
  try {
    categories.value = await categoryRepository.getByUserId(user.value.id)
  } catch (error) {
    toast.error('Gagal memuat kategori')
  } finally {
    isLoadingCategories.value = false
  }
}

const loadTransactions = async (forceReload = false) => {
  if (!user.value?.id) return

  // Create a unique key for current period and category filter
  const periodKey = `${currentPeriod.value.from.getTime()}-${currentPeriod.value.to.getTime()}-${selectedCategory.value}`

  // Check if data is already loaded for this specific combination (unless force reload)
  if (!forceReload && loadedPeriodKey.value === periodKey) {
    // Data already loaded, skip API call
    return
  }

  isLoading.value = true
  try {
    const useCase = new GetTransactionsByPeriodUseCase(transactionRepository)

    const fetchedTransactions = await useCase.execute({
      userId: user.value.id,
      from: currentPeriod.value.from,
      to: currentPeriod.value.to
    })

    // Store all transactions for summary
    allTransactions.value = fetchedTransactions

    // Apply category filter for display list
    if (selectedCategory.value) {
      transactions.value = fetchedTransactions.filter(t => t.categoryId === selectedCategory.value)
    } else {
      transactions.value = fetchedTransactions
    }

    // Mark data as loaded
    loadedPeriodKey.value = periodKey
  } catch (error) {
    toast.error('Gagal memuat transaksi')
  } finally {
    isLoading.value = false
  }
}

watch(currentPeriod, async () => {
  await loadTransactions()
}, { deep: true })

watch(selectedCategory, async () => {
  await loadTransactions()
})

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
    await loadTransactions(true)
    toast.success('Transaksi berhasil dihapus')
  } catch (error) {
    toast.error('Gagal menghapus transaksi')
  }
}

onMounted(async () => {
  await loadCategories()
  await loadTransactions()

  if (user.value?.id) {
    subscribeToTransactions(user.value.id, {
      onInsert: async () => {
        await loadTransactions(true)
      },
      onUpdate: async () => {
        await loadTransactions(true)
      },
      onDelete: async () => {
        await loadTransactions(true)
      }
    })
  }
})
</script>
