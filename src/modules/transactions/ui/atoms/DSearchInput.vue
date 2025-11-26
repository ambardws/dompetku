<template>
  <div class="relative">
    <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <DIcon name="search" :size="20" class="text-gray-400" />
    </div>
    <input
      v-model="searchValue"
      type="text"
      :placeholder="placeholder"
      class="w-full pl-12 pr-4 py-3 bg-white border border-gray-300
             rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
             outline-none transition-all placeholder-gray-400"
      @input="handleInput"
    />
    <button
      v-if="searchValue"
      type="button"
      class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
             hover:text-gray-600 transition-colors"
      @click="handleClear"
    >
      <DIcon name="x" :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DIcon from './DIcon.vue'

interface Props {
  modelValue?: string
  placeholder?: string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Cari transaksi...',
  debounce: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const searchValue = ref(props.modelValue)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue
})

const handleInput = () => {
  emit('update:modelValue', searchValue.value)

  // Debounce search
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    emit('search', searchValue.value)
  }, props.debounce)
}

const handleClear = () => {
  searchValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
