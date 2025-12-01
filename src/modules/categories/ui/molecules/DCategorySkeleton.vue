<template>
  <div class="space-y-2">
    <div
      v-for="i in count"
      :key="i"
      class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 animate-pulse"
    >
      <div class="flex items-center gap-3">
        <!-- Icon skeleton -->
        <div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
        
        <!-- Content skeleton -->
        <div class="flex-1">
          <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
        </div>
        
        <!-- Actions skeleton -->
        <div class="flex gap-2">
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 3
})
</script>
