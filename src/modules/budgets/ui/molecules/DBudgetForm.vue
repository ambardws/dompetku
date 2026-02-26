<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Category Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Kategori
      </label>
      <DCategorySelector
        v-model="form.categoryId"
        :categories="expenseCategories"
        placeholder="Pilih kategori pengeluaran"
        class="w-full"
      />
      <p v-if="errors.categoryId" class="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h8m-8 4H4" />
        </svg>
        {{ errors.categoryId }}
      </p>
    </div>

    <!-- Budget Amount -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Jumlah Budget (Bulanan)
      </label>
      <DInputAmount
        v-model="form.amount"
        placeholder="0"
        :quick-amounts="[100000, 500000, 1000000]"
        class="w-full"
      />
      <p v-if="errors.amount" class="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h8m-8 4H4" />
        </svg>
        {{ errors.amount }}
      </p>
      <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        💡 Budget akan berlaku per bulan dan akan di-reset setiap awal bulan
      </p>
    </div>

    <!-- Existing Budget Notice -->
    <div
      v-if="existingBudget"
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
    >
      <div class="flex items-start gap-2">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm">
          <p class="font-medium text-blue-800 dark:text-blue-200">
            Budget untuk kategori ini sudah ada
          </p>
          <p class="text-blue-600 dark:text-blue-300 mt-0.5">
            Budget akan diupdate dari <span class="font-semibold">{{ formatCurrency(existingBudget.amount) }}</span> menjadi <span class="font-semibold">{{ formatCurrency(form.amount) }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2 pt-2">
      <DButton
        type="submit"
        :loading="loading"
        class="flex-1"
      >
        <svg v-if="!loading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ existingBudget ? 'Update Budget' : 'Set Budget' }}
      </DButton>
      <DButton
        v-if="existingBudget"
        type="button"
        variant="ghost"
        @click="handleDelete"
        :loading="deleting"
        class="px-4"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
        </svg>
      </DButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { Category } from '~modules/categories/domain/entities/Category'
import type { Budget } from '~modules/budgets/domain/entities/Budget'
import DCategorySelector from '~modules/categories/ui/molecules/DCategorySelector.vue'
import DInputAmount from '~modules/transactions/ui/molecules/DInputAmount.vue'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'

interface Props {
  categories: Category[]
  budget?: Budget
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { categoryId: string; amount: number }): void
  (e: 'delete'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const form = reactive({
  categoryId: props.budget?.categoryId || '',
  amount: props.budget?.amount || 0
})

const errors = reactive<Record<string, string>>({})
const deleting = ref(false)

// Filter expense categories only
const expenseCategories = computed(() =>
  props.categories.filter(c => c.type === 'expense')
)

// Find existing budget for selected category
const existingBudget = computed(() => {
  if (form.categoryId && props.budget?.categoryId === form.categoryId) {
    return props.budget
  }
  return null
})

// Reset form when budget prop changes
watch(() => props.budget, (newBudget) => {
  if (newBudget) {
    form.categoryId = newBudget.categoryId
    form.amount = newBudget.amount
  } else {
    form.categoryId = ''
    form.amount = 0
  }
  clearErrors()
}, { immediate: false })

// Also reset form when submitted successfully (watch for loading changes)
watch(() => props.loading, (isLoading, wasLoading) => {
  // If loading just finished and we're not in edit mode
  if (wasLoading && !isLoading && !props.budget) {
    form.categoryId = ''
    form.amount = 0
    clearErrors()
  }
})

function validate(): boolean {
  clearErrors()
  let isValid = true

  if (!form.categoryId) {
    errors.categoryId = 'Kategori wajib dipilih'
    isValid = false
  }

  const amountNum = Number(form.amount)
  if (!amountNum || amountNum <= 0 || isNaN(amountNum)) {
    errors.amount = 'Jumlah harus lebih dari 0'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    categoryId: form.categoryId,
    amount: Number(form.amount)
  })
}

function handleDelete() {
  if (confirm('Apakah Anda yakin ingin menghapus budget ini?')) {
    emit('delete')
  }
}

function clearErrors() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}
</script>
