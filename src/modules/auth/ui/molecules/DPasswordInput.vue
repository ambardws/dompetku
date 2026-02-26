<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-slate-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        v-model="internalValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @blur="$emit('blur')"
      />

      <button
        type="button"
        :disabled="disabled"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed p-1"
        @click="toggleShowPassword"
      >
        <DIcon :name="showPassword ? 'eye-off' : 'eye'" :size="20" />
      </button>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-500 flex items-center gap-1">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-2 text-sm text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DIcon from '~modules/transactions/ui/atoms/DIcon.vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  hint: '',
  error: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const inputId = `password-input-${Math.random().toString(36).substr(2, 9)}`

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputClasses = computed(() => {
  const base = 'w-full rounded-lg border px-4 py-2.5 pr-12 transition-all duration-200 focus:outline-none focus:ring-2 text-slate-900 placeholder-slate-400'

  const state = props.error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 hover:border-slate-300'

  const disabled = props.disabled
    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
    : 'bg-white'

  return `${base} ${state} ${disabled}`
})

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}
</script>
