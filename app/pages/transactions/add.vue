<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 pb-20 transition-colors">
    <div class="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Tambah Transaksi"
        subtitle="Catat pemasukan atau pengeluaran Anda"
        icon="💸"
        :user-email="user?.email"
        :show-back-button="true"
        @back="handleBack"
        @logout="handleLogout"
      >
        <template #notification>
          <DNotificationBell />
        </template>
        <template #dark-mode-toggle>
          <DDarkModeToggle :is-dark="isDark" @toggle="toggleDarkMode" />
        </template>
      </DPageHeader>

      <!-- Scan Receipt Button -->
      <div class="mb-4">
        <button
          @click="showReceiptScanner = true"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 8h2.93a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4v.01" />
          </svg>
          <span>Scan Struk Belanja</span>
        </button>
      </div>

      <!-- Transaction Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <DTransactionForm
          ref="transactionFormRef"
          :mode="editMode ? 'edit' : 'create'"
          :transaction="formData"
          :loading="isSubmitting"
          @submit="handleSubmitTransaction"
          @cancel="handleCancel"
        />
      </div>
    </div>

    <!-- Receipt Scanner Dialog -->
    <DReceiptScannerDialog
      v-model="showReceiptScanner"
      @scan="handleReceiptScanned"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { AddTransactionUseCase } from '~modules/transactions/application/use-cases/AddTransactionUseCase'
import { UpdateTransactionUseCase } from '~modules/transactions/application/use-cases/UpdateTransactionUseCase'
import type { Transaction, TransactionType } from '~modules/transactions/domain/entities/Transaction'
import type { ScannedReceipt } from '~modules/receipt-scanner/domain/entities/ScannedReceipt'
import DTransactionForm from '~modules/transactions/ui/organisms/DTransactionForm.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DReceiptScannerDialog from '~modules/receipt-scanner/ui/organisms/DReceiptScannerDialog.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useToast } from '~~/src/shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useConfirm } from '~shared/composables/useConfirm'
import { useSharedHeader } from '~shared/composables/useSharedHeader'

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
        return navigateTo('/login')
      }
    }
  ]
})

const { user, logout } = useAuth()
const transactionRepository = useTransactionRepository()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const confirm = useConfirm()
const { handleLogout, handleBack } = useSharedHeader()

const isSubmitting = ref(false)
const editMode = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const showReceiptScanner = ref(false)
const transactionFormRef = ref()

// Form data that can be populated from receipt scan or edit mode
const formData = computed<Transaction | undefined>(() => {
  if (editingTransaction.value) {
    return editingTransaction.value
  }
  return undefined
})

// Handle receipt scan result
const handleReceiptScanned = (scannedData: ScannedReceipt) => {
  // TODO: Populate form with scanned receipt data
  // Note: Currently the form doesn't support pre-populating from scanned data.
  // To implement this, we would need to:
  // 1. Create a partial Transaction object with the scanned data
  // 2. Pass it to the form component via the transaction prop
  // 3. The form component would need to handle partial transaction data
  toast.success(`Struk dari "${scannedData.merchant}" berhasil dipindai!`)
}

const handleSubmitTransaction = async (data: {
  type: TransactionType
  amount: number
  category: string
  categoryId?: string
  note?: string
  transactionDate?: Date
}) => {
  if (!user.value?.id) return

  isSubmitting.value = true
  try {
    if (editMode.value && editingTransaction.value) {
      const useCase = new UpdateTransactionUseCase(transactionRepository)
      await useCase.execute({
        id: editingTransaction.value.id,
        userId: user.value.id,
        ...data
      })
      toast.success('Transaksi berhasil diperbarui')
    } else {
      const useCase = new AddTransactionUseCase(transactionRepository)
      await useCase.execute({
        userId: user.value.id,
        ...data
      })
      toast.success('Transaksi berhasil ditambahkan')
    }

    await router.push('/transactions')
  } catch (error) {
    toast.error('Gagal menyimpan transaksi')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  const editId = route.query.edit as string
  if (editId) {
    editMode.value = true
    try {
      const transaction = await transactionRepository.getById(editId)
      if (transaction) {
        editingTransaction.value = transaction
      } else {
        toast.error('Transaksi tidak ditemukan')
        router.push('/transactions/add')
      }
    } catch (error) {
      toast.error('Gagal memuat transaksi')
      router.push('/transactions/add')
    }
  }
})
</script>
