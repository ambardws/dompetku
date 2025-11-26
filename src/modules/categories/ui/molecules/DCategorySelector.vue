<template>
  <div class="d-category-selector">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <button
        type="button"
        :disabled="disabled || loading"
        :class="buttonClasses"
        class="w-full px-4 py-3 text-left border rounded-xl
               focus:outline-none focus:ring-2 transition-all
               disabled:bg-gray-50 disabled:cursor-not-allowed
               flex items-center justify-between"
        @click="toggleDropdown"
      >
        <span v-if="selectedCategory" class="flex items-center gap-2">
          <span class="text-lg">{{ selectedCategory.icon }}</span>
          <span class="font-medium">{{ selectedCategory.name }}</span>
        </span>
        <span v-else class="text-gray-400">{{ placeholder }}</span>

        <svg
          class="w-5 h-5 text-gray-400 transition-transform"
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
        class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg
               max-h-60 overflow-auto animate-fade-in"
      >
        <div v-if="loading" class="p-4 text-center text-gray-500">
          Loading categories...
        </div>

        <div v-else-if="categories.length === 0" class="p-4 text-center text-gray-500">
          No categories available
        </div>

        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                 flex items-center gap-3 border-b border-gray-100 last:border-0"
          :class="{ 'bg-primary-50': modelValue === category.id }"
          @click="selectCategory(category)"
        >
          <span class="text-xl">{{ category.icon }}</span>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ category.name }}</p>
          </div>
          <div
            v-if="modelValue === category.id"
            class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
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
import type { Category } from '~modules/categories/domain/entities/Category'

interface Props {
  modelValue: string | null
  categories: Category[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Select category',
  error: '',
  disabled: false,
  required: false,
  loading: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

const selectedCategory = computed(() => {
  return props.categories.find((cat) => cat.id === props.modelValue)
})

const buttonClasses = computed(() => ({
  'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20': !props.error,
  'border-red-500 focus:border-red-500 focus:ring-red-500/20': props.error,
}))

function toggleDropdown() {
  if (!props.disabled && !props.loading) {
    isOpen.value = !isOpen.value
  }
}

function selectCategory(category: Category) {
  emit('update:modelValue', category.id)
  isOpen.value = false
}

function closeDropdown(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.d-category-selector')) {
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
.d-category-selector {
  @apply w-full;
}
</style>
