<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Link Telegram Bot</h3>
            <button
              @click="close"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="isGenerating" class="text-center py-8">
            <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <p class="mt-3 text-sm text-gray-600">Generating token...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-700">{{ error }}</p>
            <button
              @click="retry"
              class="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Success State -->
          <div v-else-if="token" class="space-y-4">
            <!-- Instructions -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-sm text-blue-900 font-medium mb-2">📱 How to link:</p>
              <ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open Telegram and search for the bot</li>
                <li>Send command: <code class="bg-blue-100 px-1 rounded">/start</code></li>
                <li>Copy the token below</li>
                <li>Send: <code class="bg-blue-100 px-1 rounded">/link [token]</code></li>
              </ol>
            </div>

            <!-- Token Display -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Your Link Token:
              </label>
              <div class="flex gap-2">
                <input
                  :value="token"
                  readonly
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono"
                  @click="selectToken"
                />
                <button
                  @click="copyToken"
                  class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {{ copied ? '✓ Copied' : 'Copy' }}
                </button>
              </div>
            </div>

            <!-- Timer -->
            <div v-if="timeRemaining" class="text-xs text-gray-500 text-center">
              ⏱️ Token expires in {{ timeRemaining }}
            </div>

            <!-- Bot Link -->
            <a
              href="https://t.me/YOUR_BOT_USERNAME"
              target="_blank"
              class="block w-full px-4 py-3 bg-blue-500 text-white text-sm font-medium text-center rounded-lg hover:bg-blue-600 transition-colors"
            >
              Open Telegram Bot →
            </a>
          </div>

          <!-- Initial State (shouldn't show) -->
          <div v-else class="text-center py-4 text-sm text-gray-500">
            Click "Link Bot" to generate token
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  token: string | null
  isGenerating: boolean
  error: string | null
  timeRemaining: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'retry'): void
  (e: 'copy'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const copied = ref(false)
let copiedTimeout: NodeJS.Timeout | null = null

function close() {
  emit('update:modelValue', false)
}

function retry() {
  emit('retry')
}

function selectToken(event: Event) {
  const input = event.target as HTMLInputElement
  input.select()
}

async function copyToken() {
  emit('copy')
  copied.value = true

  if (copiedTimeout) {
    clearTimeout(copiedTimeout)
  }

  copiedTimeout = setTimeout(() => {
    copied.value = false
  }, 2000)
}

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    copied.value = false
  }
})

onUnmounted(() => {
  if (copiedTimeout) {
    clearTimeout(copiedTimeout)
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
