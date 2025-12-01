<template>
  <div class="min-h-screen transition-colors">
    <div class="w-full max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 min-h-screen shadow-2xl px-4 py-6 sm:py-8 pb-24">
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

      <!-- Transaction Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <DTransactionForm
          :mode="editMode ? 'edit' : 'create'"
          :transaction="editingTransaction || undefined"
          :loading="isSubmitting"
          @submit="handleSubmitTransaction"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransactionRepository } from '~shared/composables/useTransactionRepository'
import { AddTransactionUseCase } from '~modules/transactions/application/use-cases/AddTransactionUseCase'
import { UpdateTransactionUseCase } from '~modules/transactions/application/use-cases/UpdateTransactionUseCase'
import type { Transaction, TransactionType } from '~modules/transactions/domain/entities/Transaction'
import DTransactionForm from '~modules/transactions/ui/organisms/DTransactionForm.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useToast } from '~~/src/shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useConfirm } from '~shared/composables/useConfirm'

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
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const confirm = useConfirm()

const isSubmitting = ref(false)
const editMode = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const handleBack = () => {
  router.back()
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

    // Redirect to transactions page
    await router.push('/transactions')
  } catch (error) {
    console.error('Failed to save transaction:', error)
    toast.error('Gagal menyimpan transaksi')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

// Load transaction if editing
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
      console.error('Failed to load transaction:', error)
      toast.error('Gagal memuat transaksi')
      router.push('/transactions/add')
    }
  }
})
</script>
