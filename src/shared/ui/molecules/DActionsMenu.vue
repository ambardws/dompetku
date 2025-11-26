<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200
             hover:border-gray-300 hover:bg-gray-50 rounded-lg
             text-gray-600 hover:text-gray-900 text-sm font-medium transition-all duration-200"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      Menu
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute left-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-scale-in"
    >
      <!-- Manage Categories -->
      <button
        type="button"
        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        @click="handleManageCategories"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>Manage Categories</span>
      </button>

      <!-- Link Telegram Bot -->
      <button
        type="button"
        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        @click="handleLinkBot"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Link Telegram Bot</span>
      </button>

      <!-- Divider -->
      <div class="h-px bg-gray-100 my-1"></div>

      <!-- Export CSV -->
      <button
        type="button"
        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        @click="handleExport('csv')"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export CSV</span>
      </button>

      <!-- Export Excel -->
      <button
        type="button"
        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        @click="handleExport('excel')"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export Excel</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ExportFormat } from '~modules/transactions/domain/entities/Transaction'

const emit = defineEmits<{
  export: [format: ExportFormat]
  manageCategories: []
  linkBot: []
}>()

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleExport = (format: ExportFormat) => {
  emit('export', format)
  showDropdown.value = false
}

const handleManageCategories = () => {
  emit('manageCategories')
  showDropdown.value = false
}

const handleLinkBot = () => {
  emit('linkBot')
  showDropdown.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
