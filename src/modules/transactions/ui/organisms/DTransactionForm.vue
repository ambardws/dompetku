<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <button
          v-for="type in transactionTypes"
          :key="type.value"
          type="button"
          :class="[
            'relative py-3 px-6 rounded-lg font-semibold transition-all duration-200',
            formData.type === type.value
              ? type.value === 'income'
                ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-gray-800 text-rose-700 dark:text-rose-400 shadow-sm border border-rose-200 dark:border-rose-800'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click="formData.type = type.value"
        >
          <DIcon :name="type.icon" :size="18" class="inline mr-2" />
          {{ type.label }}
        </button>
      </div>

      <DInputAmount
        v-model="formData.amount"
        label="Jumlah"
        required
        :error="errors.amount"
        hint="Masukkan jumlah transaksi"
        :quick-amounts="[10000, 25000, 50000, 100000]"
      />

      <DCategorySelector
        v-model="formData.categoryId"
        :categories="filteredCategories"
        label="Kategori"
        placeholder="Pilih kategori"
        required
        :loading="loadingCategories"
        :error="errors.category"
      />

      <DDatePicker
        v-model="formData.transactionDate"
        label="Tanggal Transaksi"
        placeholder="Pilih tanggal transaksi"
        hint="Kosongkan untuk menggunakan tanggal hari ini"
      />

      <DTextInput
        v-model="formData.note"
        label="Catatan (Opsional)"
        placeholder="Tambahkan catatan..."
        :error="errors.note"
      />
    </div>

    <div class="flex gap-3 pt-2">
      <DButton
        v-if="mode === 'edit'"
        variant="secondary"
        type="button"
        @click="handleCancel"
        class="flex-1"
      >
        <DIcon name="x" :size="18" class="mr-2" />
        Batal
      </DButton>

      <DButton
        type="submit"
        :loading="loading"
        :full-width="mode === 'create'"
        class="shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <DIcon name="check" :size="18" class="mr-2" />
        {{ mode === 'create' ? 'Tambah Transaksi' : 'Simpan Perubahan' }}
      </DButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import type { Transaction, TransactionType } from '~modules/transactions/domain/entities/Transaction'
import type { Category } from '~modules/categories/domain/entities/Category'
import { GetCategoriesUseCase } from '~modules/categories/application/use-cases/GetCategoriesUseCase'
import { InitializeDefaultCategoriesUseCase } from '~modules/categories/application/use-cases/InitializeDefaultCategoriesUseCase'
import DButton from '../atoms/DButton.vue'
import DIcon from '../atoms/DIcon.vue'
import DTextInput from '../atoms/DTextInput.vue'
import DInputAmount from '../molecules/DInputAmount.vue'
import DDatePicker from '../molecules/DDatePicker.vue'
import DCategorySelector from '~modules/categories/ui/molecules/DCategorySelector.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'

interface Props {
  mode?: 'create' | 'edit'
  transaction?: Transaction
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  loading: false
})

const emit = defineEmits<{
  submit: [data: {
    type: TransactionType
    amount: number
    category: string
    categoryId?: string
    note?: string
    transactionDate?: Date
  }]
  cancel: []
}>()

const { user } = useAuth()
const categoryRepository = useCategoryRepository()
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

const transactionTypes = [
  { value: 'income' as TransactionType, label: 'Pemasukan', icon: 'plus' as const },
  { value: 'expense' as TransactionType, label: 'Pengeluaran', icon: 'minus' as const }
]

const formData = reactive({
  type: 'expense' as TransactionType,
  amount: 0,
  category: '',
  categoryId: null as string | null,
  note: '',
  transactionDate: '' as string // YYYY-MM-DD format for input type="date"
})

// Filter categories by transaction type
const filteredCategories = computed(() => {
  return categories.value.filter((cat) => cat.type === formData.type)
})

const errors = reactive({
  amount: '',
  category: '',
  note: ''
})

const resetErrors = () => {
  errors.amount = ''
  errors.category = ''
  errors.note = ''
}

const validateForm = (): boolean => {
  resetErrors()
  let isValid = true

  if (formData.amount <= 0) {
    errors.amount = 'Jumlah harus lebih dari 0'
    isValid = false
  }

  if (!formData.categoryId) {
    errors.category = 'Kategori tidak boleh kosong'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) return

  // Get category name from selected category
  const selectedCategory = categories.value.find((cat) => cat.id === formData.categoryId)
  const categoryName = selectedCategory?.name || formData.category

  // Convert transactionDate string to Date object if provided
  const transactionDate = formData.transactionDate
    ? new Date(formData.transactionDate)
    : undefined

  emit('submit', {
    type: formData.type,
    amount: formData.amount,
    category: categoryName,
    categoryId: formData.categoryId || undefined,
    note: formData.note.trim() || undefined,
    transactionDate
  })

  if (props.mode === 'create') {
    resetForm()
  }
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}

const resetForm = () => {
  formData.type = 'expense'
  formData.amount = 0
  formData.category = ''
  formData.categoryId = null
  formData.note = ''
  formData.transactionDate = ''
  resetErrors()
}

watch(() => props.transaction, (transaction) => {
  if (transaction && props.mode === 'edit') {
    formData.type = transaction.type
    formData.amount = transaction.amount
    formData.category = transaction.category
    formData.categoryId = transaction.categoryId || null
    formData.note = transaction.note || ''

    // Format transactionDate to YYYY-MM-DD for input type="date"
    if (transaction.transactionDate) {
      const date = new Date(transaction.transactionDate)
      formData.transactionDate = date.toISOString().split('T')[0]
    }
  }
}, { immediate: true })

// Load categories on mount
onMounted(async () => {
  if (!user.value?.id) return

  loadingCategories.value = true
  try {
    const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository)
    categories.value = await getCategoriesUseCase.execute({ userId: user.value.id })

    // If no categories, initialize defaults
    if (categories.value.length === 0) {
      const initUseCase = new InitializeDefaultCategoriesUseCase(categoryRepository)
      categories.value = await initUseCase.execute(user.value.id)
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loadingCategories.value = false
  }
})
</script>
