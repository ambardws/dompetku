<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('update:modelValue', false)"
  >
    <div
      class="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Scan Struk Belanja
          </h2>
          <button
            @click="handleClose"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Upload foto struk dan sistem akan mengekstrak data menggunakan OCR
        </p>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Uploader Phase -->
        <DReceiptUploader
          v-if="phase === 'upload'"
          :is-processing="isProcessing"
          :error="error"
          :processing-status="processingStatus"
          @upload="handleUpload"
          @remove="handleRemove"
        />

        <!-- Review Phase -->
        <DReceiptReview
          v-else-if="phase === 'review' && scannedData"
          :data="scannedData"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        />

        <!-- Success Message -->
        <div
          v-else-if="phase === 'success'"
          class="text-center py-8"
        >
          <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Berhasil!
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Data struk telah ditambahkan ke transaksi
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useReceiptScanner } from '~shared/composables/useReceiptScanner'
import DReceiptUploader from '~modules/receipt-scanner/ui/molecules/DReceiptUploader.vue'
import DReceiptReview from '~modules/receipt-scanner/ui/molecules/DReceiptReview.vue'
import type { ScannedReceipt } from '~modules/receipt-scanner/domain/entities/ScannedReceipt'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'scan', data: ScannedReceipt): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { state, scanReceipt, reset } = useReceiptScanner()

type Phase = 'upload' | 'review' | 'success'
const phase = ref<Phase>('upload')

const isProcessing = computed(() => state.value.isProcessing)
const error = computed(() => state.value.error)
const scannedData = computed(() => state.value.scannedData)

const processingStatus = ref('')

const handleUpload = async (file: File) => {
  processingStatus.value = 'Menganalisa gambar dengan OCR...'
  phase.value = 'upload'

  const result = await scanReceipt(file)

  if (result) {
    phase.value = 'review'
  }
}

const handleRemove = () => {
  reset()
  phase.value = 'upload'
}

const handleConfirm = (data: ScannedReceipt) => {
  emit('scan', data)
  phase.value = 'success'

  // Auto close after success
  setTimeout(() => {
    handleClose()
  }, 1500)
}

const handleCancel = () => {
  reset()
  phase.value = 'upload'
}

const handleClose = () => {
  emit('update:modelValue', false)
  // Reset after dialog closes
  setTimeout(() => {
    reset()
    phase.value = 'upload'
  }, 300)
}

// Reset when dialog opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    reset()
    phase.value = 'upload'
  }
})
</script>
