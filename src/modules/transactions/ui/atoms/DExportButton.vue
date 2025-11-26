<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
             hover:border-gray-400 hover:shadow-sm rounded-xl
             text-gray-700 hover:text-gray-900 font-medium transition-all duration-200"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
    >
      <button
        type="button"
        class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
        @click="handleExport('csv')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export as CSV
      </button>
      <button
        type="button"
        class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
        @click="handleExport('excel')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export as Excel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ExportFormat } from '~modules/transactions/domain/entities/Transaction'

const emit = defineEmits<{
  export: [format: ExportFormat]
}>()

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleExport = (format: ExportFormat) => {
  emit('export', format)
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
