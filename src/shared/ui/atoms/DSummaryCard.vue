<template>
  <div
    :class="[
      'relative overflow-hidden rounded-xl p-5 transition-all duration-300',
      'hover:shadow-sm hover:-translate-y-0.5',
      cardClasses
    ]"
  >
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-2">
        <div :class="['w-7 h-7 rounded-lg flex items-center justify-center', iconBgClass]">
          <slot name="icon">
            <svg class="w-3.5 h-3.5" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </slot>
        </div>
        <p class="text-xs font-medium text-gray-600">{{ label }}</p>
      </div>

      <p :class="['text-2xl font-bold mb-1', valueClass]">
        {{ formattedValue }}
      </p>

      <p v-if="subtitle" class="text-xs text-gray-500">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number
  variant?: 'balance' | 'income' | 'expense' | 'neutral'
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral'
})

const formattedValue = computed(() => {
  return 'Rp ' + Math.abs(props.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
})

const cardClasses = computed(() => {
  switch (props.variant) {
    case 'balance':
      return 'bg-white border border-gray-200'
    case 'income':
      return 'bg-white border border-gray-200'
    case 'expense':
      return 'bg-white border border-gray-200'
    default:
      return 'bg-white border border-gray-200'
  }
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'balance':
      return 'bg-gray-100'
    case 'income':
      return 'bg-emerald-50'
    case 'expense':
      return 'bg-rose-50'
    default:
      return 'bg-gray-100'
  }
})

const iconClass = computed(() => {
  switch (props.variant) {
    case 'balance':
      return 'text-gray-700'
    case 'income':
      return 'text-emerald-600'
    case 'expense':
      return 'text-rose-600'
    default:
      return 'text-gray-700'
  }
})

const valueClass = computed(() => {
  switch (props.variant) {
    case 'balance':
      return props.value >= 0 ? 'text-gray-900' : 'text-rose-600'
    case 'income':
      return 'text-gray-900'
    case 'expense':
      return 'text-gray-900'
    default:
      return 'text-gray-900'
  }
})
</script>
