<template>
  <div class="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-[60] space-y-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-sm">
    <TransitionGroup name="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto"
      >
        <div
          :class="[
            'bg-white rounded-lg shadow-lg border w-full',
            'p-3 sm:p-4 flex items-start gap-2 sm:gap-3',
            variantClasses(toast.variant || 'info')
          ]"
        >
          <!-- Icon -->
          <div :class="['flex-shrink-0 w-5 h-5', iconColorClass(toast.variant || 'info')]">
            <svg v-if="toast.variant === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="toast.variant === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else-if="toast.variant === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="text-sm font-semibold text-gray-900 mb-0.5">{{ toast.title }}</p>
            <p class="text-sm text-gray-600">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            @click="remove(toast.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~shared/composables/useToast'

const { toasts, remove } = useToast()

const variantClasses = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'border-emerald-200'
    case 'error':
      return 'border-rose-200'
    case 'warning':
      return 'border-amber-200'
    default:
      return 'border-gray-200'
  }
}

const iconColorClass = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'text-emerald-600'
    case 'error':
      return 'text-rose-600'
    case 'warning':
      return 'text-amber-600'
    default:
      return 'text-gray-600'
  }
}
</script>

<style scoped>
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
