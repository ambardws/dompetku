<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center gap-2 mb-4">
      <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Receipt Successfully Scanned
      </h3>
    </div>

    <div class="space-y-4">
      <!-- Merchant Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Store / Merchant
        </label>
        <input
          v-model="formData.merchant"
          type="text"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Example: Indomaret"
        />
      </div>

      <!-- Total Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Total Expense
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            Rp
          </span>
          <input
            v-model="formData.total"
            type="number"
            class="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          v-model="formData.date"
          type="date"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          v-model="formData.category"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="groceries">Groceries</option>
          <option value="food">Food & Beverage</option>
          <option value="transport">Transportation</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
          <option value="entertainment">Entertainment</option>
          <option value="bills">Bills</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Items (Collapsible) -->
      <div v-if="formData.items && formData.items.length > 0">
        <button
          @click="showItems = !showItems"
          class="flex items-center justify-between w-full text-left"
        >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Detail Item ({{ formData.items.length }})
          </span>
          <svg
            class="w-4 h-4 text-gray-500 transition-transform"
            :class="{ 'rotate-180': showItems }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showItems" class="mt-3 space-y-2">
          <div
            v-for="(item, index) in formData.items"
            :key="index"
            class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ item.quantity }} x Rp {{ item.unitPrice.toLocaleString('id-ID') }}
                </p>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                Rp {{ item.total.toLocaleString('id-ID') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
        >
          Ulang / Scan Ulang
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
        >
          Gunakan Data Ini
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { ScannedReceipt } from '~modules/receipt-scanner/domain/entities/ScannedReceipt'

interface Props {
  data: ScannedReceipt
}

interface Emits {
  (e: 'confirm', data: ScannedReceipt): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showItems = ref(false)

const formData = reactive<ScannedReceipt>({
  merchant: '',
  total: 0,
  date: '',
  time: '',
  items: [],
  category: 'other'
})

// Initialize form data when props change
watch(() => props.data, (newData) => {
  if (newData) {
    formData.merchant = newData.merchant || ''
    formData.total = newData.total || 0
    formData.date = newData.date || new Date().toISOString().split('T')[0] || ''
    formData.time = newData.time || ''
    formData.items = newData.items || []
    formData.category = newData.category || 'other'
  }
}, { immediate: true })

const handleConfirm = () => {
  emit('confirm', { ...formData })
}
</script>
