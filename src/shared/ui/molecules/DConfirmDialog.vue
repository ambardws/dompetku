<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <!-- Dialog -->
        <div
          :class="[
            'relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
            'w-full max-w-md transform transition-all',
            'border border-gray-200 dark:border-gray-700'
          ]"
        >
          <!-- Icon Container -->
          <div class="px-6 pt-6 pb-4 flex justify-center">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center',
                'animate-scale-in',
                iconBgClass
              ]"
            >
              <!-- Danger Icon (Delete) -->
              <svg
                v-if="variant === 'danger'"
                class="w-8 h-8"
                :class="iconColorClass"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>

              <!-- Warning Icon (Logout) -->
              <svg
                v-else-if="variant === 'warning'"
                class="w-8 h-8"
                :class="iconColorClass"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>

              <!-- Info Icon (Default) -->
              <svg
                v-else
                class="w-8 h-8"
                :class="iconColorClass"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 pb-6 text-center">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {{ title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {{ message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 flex gap-3">
            <button
              type="button"
              @click="handleCancel"
              :disabled="loading"
              class="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200
                bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-600
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="handleConfirm"
              :disabled="loading"
              :class="[
                'flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                'flex items-center justify-center gap-2',
                confirmButtonClass
              ]"
            >
              <svg
                v-if="loading"
                class="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{{ loading ? loadingText : confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface ConfirmDialogProps {
  modelValue?: boolean
  title: string
  message: string
  variant?: 'info' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  loadingText?: string
  loading?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  modelValue: false,
  variant: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  loading: false,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const show = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    show.value = newValue
  }
)

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-rose-100 dark:bg-rose-900/30'
    case 'warning':
      return 'bg-amber-100 dark:bg-amber-900/30'
    default:
      return 'bg-blue-100 dark:bg-blue-900/30'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'text-rose-600 dark:text-rose-400'
    case 'warning':
      return 'text-amber-600 dark:text-amber-400'
    default:
      return 'text-blue-600 dark:text-blue-400'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700'
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700'
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700'
  }
})

const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
}

const handleCancel = () => {
  if (props.loading) return
  show.value = false
  emit('update:modelValue', false)
  emit('cancel')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !props.loading) {
    handleCancel()
  }
}
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-active > div:last-child,
.dialog-leave-active > div:last-child {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div:last-child {
  transform: scale(0.95) translateY(-20px);
}

.dialog-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.4s ease-out;
}
</style>
