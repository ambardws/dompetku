<template>
  <div class="d-color-picker">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-gray-400">*</span>
    </label>

    <div class="flex gap-2">
      <!-- Color Preview -->
      <button
        type="button"
        :disabled="disabled"
        class="w-12 h-10 rounded-lg border transition-all
               disabled:opacity-50 disabled:cursor-not-allowed"
        :style="{ backgroundColor: modelValue }"
        :class="buttonClasses"
        @click="toggleDropdown"
      >
        <span class="sr-only">Selected color</span>
      </button>

      <!-- Hex Input -->
      <input
        v-model="internalValue"
        type="text"
        placeholder="#6B7280"
        maxlength="7"
        :disabled="disabled"
        :class="inputClasses"
        class="flex-1 px-3 py-2 text-sm border rounded-lg uppercase
               focus:outline-none focus:ring-2 transition-all
               disabled:bg-gray-50 disabled:cursor-not-allowed"
        @input="handleInput"
      />
    </div>

    <!-- Color Palette Dropdown -->
    <div
      v-if="isOpen"
      class="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in"
    >
      <p class="text-xs text-gray-500 mb-2">Popular colors:</p>
      <div class="grid grid-cols-10 gap-1.5">
        <button
          v-for="color in colors"
          :key="color"
          type="button"
          class="w-7 h-7 rounded-md transition-all border-2"
          :class="{
            'border-gray-800 ring-2 ring-gray-200': modelValue.toUpperCase() === color.toUpperCase(),
            'border-gray-200 hover:border-gray-300': modelValue.toUpperCase() !== color.toUpperCase()
          }"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        >
          <span class="sr-only">{{ color }}</span>
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-1.5 text-xs text-red-500 animate-fade-in">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  error: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

// Predefined color palette - minimalist muted colors
const colors = [
  '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6',
  '#374151', '#4B5563', '#1F2937', '#111827', '#000000',
  '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2',
  '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA',
  '#CA8A04', '#EAB308', '#FACC15', '#FDE047', '#FEF3C7',
  '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0',
  '#0891B2', '#06B6D4', '#22D3EE', '#67E8F9', '#CFFAFE',
  '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE',
]

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const buttonClasses = computed(() => ({
  'border-gray-300': !props.error,
  'border-red-500': props.error,
}))

const inputClasses = computed(() => ({
  'border-gray-300 focus:border-gray-900 focus:ring-gray-900/10': !props.error,
  'border-red-500 focus:border-red-500 focus:ring-red-500/20': props.error,
}))

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectColor(color: string) {
  emit('update:modelValue', color)
  isOpen.value = false
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Ensure it starts with #
  if (value && !value.startsWith('#')) {
    value = '#' + value
  }

  // Uppercase for consistency
  value = value.toUpperCase()

  emit('update:modelValue', value)
}

function closeDropdown(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.d-color-picker')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.d-color-picker {
  @apply w-full;
}
</style>
