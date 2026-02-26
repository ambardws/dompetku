<template>
  <div class="relative w-full">
    <select
      v-model="selectedValue"
      :disabled="loading || categories.length === 0"
      class="w-full appearance-none px-3 py-2 pr-10 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      @change="handleChange"
    >
      <option value="">All Categories</option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>

    <!-- Custom arrow icon -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        class="w-4 h-4 text-gray-500 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7 7"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Category {
  id: string
  name: string
  icon?: string
}

interface Props {
  modelValue?: string
  categories: Category[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const selectedValue = ref(props.modelValue || '')

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue || ''
})

const handleChange = () => {
  emit('update:modelValue', selectedValue.value)
  emit('change', selectedValue.value)
}
</script>
