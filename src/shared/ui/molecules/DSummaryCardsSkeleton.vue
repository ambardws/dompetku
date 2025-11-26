<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <!-- Income Card Skeleton -->
    <div class="summary-card-skeleton">
      <div class="flex items-center gap-2 mb-3">
        <DSkeleton custom-width="32px" custom-height="32px" rounded="rounded-lg" />
        <DSkeleton custom-width="120px" height="4" />
      </div>
      <DSkeleton custom-width="180px" height="8" class="mb-1" />
    </div>

    <!-- Expense Card Skeleton -->
    <div class="summary-card-skeleton">
      <div class="flex items-center gap-2 mb-3">
        <DSkeleton custom-width="32px" custom-height="32px" rounded="rounded-lg" />
        <DSkeleton custom-width="140px" height="4" />
      </div>
      <DSkeleton custom-width="160px" height="8" class="mb-1" />
    </div>

    <!-- Balance Card Skeleton -->
    <div class="summary-card-skeleton">
      <div class="flex items-center gap-2 mb-3">
        <DSkeleton custom-width="32px" custom-height="32px" rounded="rounded-lg" />
        <DSkeleton custom-width="100px" height="4" />
      </div>
      <DSkeleton custom-width="200px" height="8" class="mb-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DSkeleton from '../atoms/DSkeleton.vue'
</script>

<style scoped>
.summary-card-skeleton {
  @apply p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700;
}
</style>
