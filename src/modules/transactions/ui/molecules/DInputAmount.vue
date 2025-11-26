<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
        Rp
      </div>

      <input
        :value="displayValue"
        type="text"
        inputmode="decimal"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        class="w-full rounded-xl border px-4 py-3 pl-12 transition-all duration-200 focus:outline-none focus:ring-2"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
        <button
          v-for="quick in quickAmounts"
          :key="quick"
          type="button"
          class="px-2 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          @click="setQuickAmount(quick)"
        >
          {{ formatQuickAmount(quick) }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-500 animate-slide-down">
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-2 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  quickAmounts?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '0',
  disabled: false,
  required: false,
  quickAmounts: () => [10000, 25000, 50000]
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const isFocused = ref(false)

const displayValue = computed(() => {
  if (props.modelValue === 0) return ''
  return formatNumber(props.modelValue)
})

const inputClasses = computed(() => {
  const state = props.error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : isFocused.value
    ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-500/20'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
  const disabled = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  return `${state} ${disabled}`
})

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parseNumber = (str: string): number => {
  const cleaned = str.replace(/\./g, '').replace(/[^\d]/g, '')
  return parseInt(cleaned) || 0
}

const formatQuickAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${amount / 1000000}jt`
  }
  if (amount >= 1000) {
    return `${amount / 1000}k`
  }
  return amount.toString()
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseNumber(target.value)
  emit('update:modelValue', value)
}

const handleBlur = () => {
  isFocused.value = false
}

const handleFocus = () => {
  isFocused.value = true
}

const setQuickAmount = (amount: number) => {
  emit('update:modelValue', amount)
}
</script>
