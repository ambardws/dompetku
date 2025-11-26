<template>
  <div class="d-icon-picker">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <button
        type="button"
        :disabled="disabled"
        :class="buttonClasses"
        class="w-full px-4 py-3 text-left border rounded-xl
               focus:outline-none focus:ring-2 transition-all
               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
               disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
               flex items-center justify-between"
        @click="toggleDropdown"
      >
        <span v-if="modelValue" class="flex items-center gap-2">
          <span class="text-2xl">{{ modelValue }}</span>
          <span class="text-gray-600 dark:text-gray-400">Selected icon</span>
        </span>
        <span v-else class="text-gray-400 dark:text-gray-500">{{ placeholder }}</span>

        <svg
          class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        v-if="isOpen"
        class="absolute z-20 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg
               max-h-80 overflow-auto animate-fade-in"
      >
        <div class="p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Select an icon:</p>
          <div class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in icons"
              :key="icon"
              type="button"
              class="w-10 h-10 flex items-center justify-center text-2xl rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-2"
              :class="{
                'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20': modelValue === icon,
                'border-transparent': modelValue !== icon
              }"
              @click="selectIcon(icon)"
            >
              {{ icon }}
            </button>
          </div>
        </div>
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
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Select icon',
  error: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

// Common icons for categories
const icons = [
  '🍔', '🍕', '☕', '🍜', '🥗', '🍱', '🍰', '🍺',
  '🚗', '✈️', '🚌', '🚇', '🚲', '🏍️', '⛽', '🚕',
  '🛍️', '👕', '👟', '💄', '📱', '💻', '🎮', '📚',
  '🎬', '🎵', '🎨', '🎭', '🎪', '🎯', '🎲', '🎳',
  '⚕️', '💊', '🏥', '💉', '🧘', '🏃', '⚽', '🏋️',
  '📝', '💡', '🏠', '🔑', '🔌', '💧', '📡', '📞',
  '📚', '✏️', '🎓', '📖', '🖊️', '📐', '🔬', '🎒',
  '💰', '💵', '💴', '💶', '💷', '💳', '💸', '🏦',
  '💼', '👔', '📊', '📈', '💻', '🖥️', '⌨️', '🖱️',
  '🎁', '🎉', '🎊', '🎈', '🎀', '💝', '🎂', '🍾',
  '📦', '📋', '📄', '📃', '📑', '🗂️', '📁', '🗃️',
  '❤️', '⭐', '✨', '🌟', '💫', '🔥', '💥', '✅',
]

const buttonClasses = computed(() => ({
  'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20': !props.error,
  'border-red-500 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20': props.error,
}))

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectIcon(icon: string) {
  emit('update:modelValue', icon)
  isOpen.value = false
}

function closeDropdown(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.d-icon-picker')) {
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
.d-icon-picker {
  @apply w-full;
}
</style>
