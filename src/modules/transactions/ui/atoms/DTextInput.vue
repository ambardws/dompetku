<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <div v-if="$slots.suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <slot name="suffix" />
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
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'tel'
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
  focus: []
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

const inputClasses = computed(() => {
  const base = 'w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2'
  const state = props.error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : isFocused.value
    ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-500/20'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
  const disabled = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  return `${base} ${state} ${disabled}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>
