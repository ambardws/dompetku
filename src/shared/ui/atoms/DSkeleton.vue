<template>
  <div
    class="skeleton-loader"
    :class="[
      rounded,
      `h-${height}`,
      width ? `w-${width}` : 'w-full'
    ]"
    :style="{ width: customWidth, height: customHeight }"
  />
</template>

<script setup lang="ts">
interface Props {
  height?: string
  width?: string
  customWidth?: string
  customHeight?: string
  rounded?: string
}

withDefaults(defineProps<Props>(), {
  height: '4',
  rounded: 'rounded-md',
})
</script>

<style scoped>
.skeleton-loader {
  @apply bg-gray-200 dark:bg-gray-700;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
