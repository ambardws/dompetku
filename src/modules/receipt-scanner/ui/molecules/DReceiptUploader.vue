<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center gap-2 mb-4">
      <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 8h2.93a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v.01" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Upload Struk Belanja
      </h3>
    </div>

    <!-- Upload Area -->
    <div
      v-if="!previewUrl"
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      @click="selectFile"
      @drop.prevent="handleDrop"
      @dragover.prevent
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      <p class="text-gray-600 dark:text-gray-400 mb-2">
        Klik atau drag & drop foto struk
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-500">
        Format: JPG, PNG (Max 5MB)
      </p>
    </div>

    <!-- Preview -->
    <div v-else class="space-y-3">
      <div class="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        <img
          :src="previewUrl"
          alt="Receipt preview"
          class="w-full h-auto object-contain max-h-96"
        />

        <!-- Remove Button -->
        <button
          @click="removeImage"
          class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- File Info -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">{{ fileName }}</span>
        <span class="text-gray-500 dark:text-gray-500">{{ fileSize }}</span>
      </div>

      <!-- Retake Photo -->
      <button
        @click="selectFile"
        class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
      </button>
    </div>

    <!-- Processing Indicator -->
    <div v-if="isProcessing" class="mt-4">
      <div class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
        <div>
          <p class="text-sm font-medium text-blue-900 dark:text-blue-100">
            Memproses struk...
          </p>
          <p class="text-xs text-blue-700 dark:text-blue-300">
            {{ processingStatus }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m0 0l3 3m-3-3" />
        </svg>
        <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  isProcessing?: boolean
  error?: string | null
  processingStatus?: string
}

interface Emits {
  (e: 'upload', file: File): void
  (e: 'remove'): void
}

const props = withDefaults(defineProps<Props>(), {
  isProcessing: false,
  error: null,
  processingStatus: 'Menganalisa gambar...'
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const fileName = ref<string>('')
const fileSize = ref<string>('')

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file terlalu besar. Maksimal 5MB.')
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    fileName.value = file.name
    fileSize.value = formatFileSize(file.size)

    // Emit upload event
    emit('upload', file)
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  previewUrl.value = null
  fileName.value = ''
  fileSize.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('remove')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

defineExpose({
  removeImage
})
</script>
