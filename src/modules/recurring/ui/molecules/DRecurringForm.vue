<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Type Selection -->
    <div class="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-700 rounded-xl w-full">
      <button
        v-for="type in transactionTypes"
        :key="type.value"
        type="button"
        :class="[
          'relative py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 w-full',
          form.type === type.value
            ? type.value === 'income'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
            : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        ]"
        @click="form.type = type.value"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Amount -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
      <DInputAmount v-model="form.amount" placeholder="0" :quick-amounts="[10000, 25000, 50000, 100000]" class="w-full" />
      <p v-if="errors.amount" class="mt-1.5 text-xs text-red-600 dark:text-red-400">{{ errors.amount }}</p>
    </div>

    <!-- Category -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
      <DCategorySelector v-model="form.categoryId" :categories="filteredCategories" placeholder="Select category" class="w-full" />
      <p v-if="errors.category" class="mt-1.5 text-xs text-red-600 dark:text-red-400">{{ errors.category }}</p>
    </div>

    <!-- Frequency -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="freq in frequencies"
          :key="freq.value"
          type="button"
          :class="[
            'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
            form.frequency === freq.value
              ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          ]"
          @click="form.frequency = freq.value"
        >
          {{ freq.label }}
        </button>
      </div>
    </div>

    <!-- Start Date -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
      <input
        v-model="form.startDate"
        type="date"
        class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-gray-900 dark:text-white"
      />
    </div>

    <!-- Note -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (Optional)</label>
      <input
        v-model="form.note"
        type="text"
        placeholder="Add a note..."
        class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-gray-900 dark:text-white"
      />
    </div>

    <!-- Submit -->
    <DButton type="submit" :loading="loading" class="w-full">
      {{ existingRecurring ? 'Update Recurring' : 'Create Recurring' }}
    </DButton>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { RecurringTransaction, RecurringFrequency } from '~/modules/recurring/domain/entities/RecurringTransaction'
import DInputAmount from '~modules/transactions/ui/molecules/DInputAmount.vue'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'
import DCategorySelector from '~modules/categories/ui/molecules/DCategorySelector.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { GetCategoriesUseCase } from '~modules/categories/application/use-cases/GetCategoriesUseCase'
import type { Category } from '~/modules/categories/domain/entities/Category'

interface Props {
  recurring?: RecurringTransaction
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { loading: false })
const emit = defineEmits<{ submit: [data: Partial<RecurringTransaction>]; delete: [] }>()

const { user } = useAuth()
const categoryRepository = useCategoryRepository()
const categories = ref<Category[]>([])

const transactionTypes = [
  { value: 'income' as const, label: 'Income' },
  { value: 'expense' as const, label: 'Expense' }
]

const frequencies = [
  { value: 'daily' as RecurringFrequency, label: 'Daily' },
  { value: 'weekly' as RecurringFrequency, label: 'Weekly' },
  { value: 'monthly' as RecurringFrequency, label: 'Monthly' }
]

const form = reactive({
  type: (props.recurring?.type || 'expense') as 'income' | 'expense',
  amount: props.recurring?.amount || 0,
  categoryId: props.recurring?.categoryId || '',
  category: props.recurring?.category || '',
  frequency: (props.recurring?.frequency || 'monthly') as RecurringFrequency,
  startDate: props.recurring?.startDate ? new Date(props.recurring.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  note: props.recurring?.note || ''
})

const errors = reactive({ amount: '', category: '' })

const existingRecurring = computed(() => !!props.recurring)

const filteredCategories = computed(() => categories.value.filter(c => c.type === form.type))

const validate = () => {
  errors.amount = errors.category = ''
  if (!form.amount || form.amount <= 0) { errors.amount = 'Amount must be greater than 0'; return false }
  if (!form.categoryId) { errors.category = 'Category is required'; return false }
  return true
}

const handleSubmit = () => {
  if (!validate()) return
  const selectedCategory = categories.value.find(c => c.id === form.categoryId)
  emit('submit', {
    type: form.type,
    amount: Number(form.amount),
    category: selectedCategory?.name || form.category,
    categoryId: form.categoryId || undefined,
    frequency: form.frequency,
    startDate: new Date(form.startDate),
    note: form.note || undefined
  })
}

// Load categories on mount
onMounted(async () => {
  if (!user.value?.id) return
  const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository)
  categories.value = await getCategoriesUseCase.execute({ userId: user.value.id })
})
</script>
