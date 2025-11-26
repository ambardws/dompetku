<template>
  <div class="d-password-input">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1.5">
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
        class="w-full px-4 py-2.5 pr-12 border rounded-xl
               focus:outline-none focus:ring-2 transition-all
               disabled:bg-gray-50 disabled:cursor-not-allowed"
        @blur="$emit('blur')"
      />

      <button
        type="button"
        :disabled="disabled"
        class="absolute right-3 top-1/2 -translate-y-1/2
               text-gray-400 hover:text-gray-600 transition-colors
               disabled:cursor-not-allowed"
        @click="toggleShowPassword"
      >
        <DIcon :name="showPassword ? 'eye-off' : 'eye'" size="20" />
      </button>
    </div>

    <p v-if="hint && !error" class="mt-1.5 text-xs text-gray-500">
      {{ hint }}
    </p>

    <p v-if="error" class="mt-1.5 text-xs text-red-500 animate-fade-in">
      {{ error }}
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

const inputClasses = computed(() => ({
  'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20': !props.error,
  'border-red-500 focus:border-red-500 focus:ring-red-500/20': props.error,
}))

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.d-password-input {
  @apply w-full;
}
</style>
