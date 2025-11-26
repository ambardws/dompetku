<template>
  <svg
    :class="iconClasses"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path v-if="name === 'plus'" d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path v-else-if="name === 'minus'" d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path v-else-if="name === 'trash'" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="name === 'edit'" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="name === 'check'" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="name === 'close'" d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="name === 'filter'" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="name === 'calendar'" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle v-else-if="name === 'info'" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
    <path v-else d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type IconName = 'plus' | 'minus' | 'trash' | 'edit' | 'check' | 'close' | 'filter' | 'calendar' | 'info'

interface Props {
  name: IconName
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor'
})

const iconClasses = computed(() => {
  return `inline-block transition-colors duration-200`
})
</script>
