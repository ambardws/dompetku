<template>
  <div class="space-y-4 px-6 py-4">
    <!-- Filter Pills -->
    <div class="flex items-center gap-2 mb-4">
      <div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            selectedFilter === filter.value
              ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="mb-4">
      <DSearchInput
        v-model="searchQuery"
        placeholder="Cari berdasarkan kategori atau catatan..."
        @search="handleSearch"
      />
    </div>

    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse"
      />
    </div>

    <div v-else-if="filteredTransactions.length === 0" class="text-center py-16">
      <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
        <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-1">Belum ada transaksi</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Mulai tambahkan transaksi pertama kamu</p>
    </div>

    <div v-else class="space-y-2">
      <DTransactionRow
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        :transaction="transaction"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <div v-if="hasMore && !loading" class="text-center pt-4">
      <DButton variant="ghost" @click="loadMore">
        Muat lebih banyak
      </DButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'
import DButton from '../atoms/DButton.vue'
import DIcon from '../atoms/DIcon.vue'
import DSearchInput from '../atoms/DSearchInput.vue'
import DTransactionRow from '../molecules/DTransactionRow.vue'

interface Props {
  transactions: Transaction[]
  loading?: boolean
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: false
})

const emit = defineEmits<{
  edit: [transaction: Transaction]
  delete: [transaction: Transaction]
  loadMore: []
  search: [query: string]
}>()

type FilterType = 'all' | 'income' | 'expense'

const filters = [
  { value: 'all' as FilterType, label: 'Semua' },
  { value: 'income' as FilterType, label: 'Pemasukan' },
  { value: 'expense' as FilterType, label: 'Pengeluaran' }
]

const selectedFilter = ref<FilterType>('all')
const searchQuery = ref('')

const filteredTransactions = computed(() => {
  let results = props.transactions

  // Filter by type
  if (selectedFilter.value !== 'all') {
    results = results.filter(t => t.type === selectedFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(t => {
      const categoryMatch = t.category.toLowerCase().includes(query)
      const noteMatch = t.note?.toLowerCase().includes(query) || false
      return categoryMatch || noteMatch
    })
  }

  return results
})

const handleSearch = (query: string) => {
  emit('search', query)
}

const handleEdit = (transaction: Transaction) => {
  emit('edit', transaction)
}

const handleDelete = (transaction: Transaction) => {
  emit('delete', transaction)
}

const loadMore = () => {
  emit('loadMore')
}
</script>
