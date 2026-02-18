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
        v-for="transaction in paginatedTransactions"
        :key="transaction.id"
        :transaction="transaction"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1 && !loading" class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <!-- Info Text - Desktop -->
      <div class="hidden sm:block text-sm text-gray-600 dark:text-gray-400 mb-3">
        Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ filteredTransactions.length }} transaksi
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Info Text - Mobile -->
        <div class="sm:hidden text-xs text-gray-600 dark:text-gray-400 text-center">
          {{ startIndex + 1 }}-{{ endIndex }} dari {{ filteredTransactions.length }}
        </div>

        <div class="flex items-center justify-center sm:justify-end gap-1 sm:gap-2">
          <button
            :disabled="currentPage === 1"
            :class="[
              'px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap',
              currentPage === 1
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            ]"
            @click="goToPage(currentPage - 1)"
          >
            <span class="hidden sm:inline">Sebelumnya</span>
            <span class="sm:hidden">Prev</span>
          </button>

          <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[150px] sm:max-w-none">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="[
                'min-w-[32px] sm:w-10 h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex-shrink-0',
                currentPage === page
                  ? 'bg-primary-600 dark:bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="currentPage === totalPages"
            :class="[
              'px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap',
              currentPage === totalPages
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            ]"
            @click="goToPage(currentPage + 1)"
          >
            <span class="hidden sm:inline">Selanjutnya</span>
            <span class="sm:hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import DSearchInput from '../atoms/DSearchInput.vue'
import DTransactionRow from '../molecules/DTransactionRow.vue'
import type { Transaction } from '../../domain/entities/Transaction'


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
const currentPage = ref(1)
const itemsPerPage = 5
const windowWidth = ref(0)

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

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

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage, filteredTransactions.value.length)
})

const paginatedTransactions = computed(() => {
  return filteredTransactions.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  // Reduce visible pages on mobile for better UX
  const maxVisiblePages = windowWidth.value < 640 ? 3 : 5

  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Reset to page 1 when filter or search changes
watch([selectedFilter, searchQuery], () => {
  currentPage.value = 1
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

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
