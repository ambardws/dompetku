<template>
  <div class="analytics-card-skeleton">
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <DSkeleton custom-width="40px" custom-height="40px" rounded="rounded-lg" />
        <DSkeleton custom-width="180px" height="6" />
      </div>
    </div>

    <div class="p-6">
      <!-- Summary Stats Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div v-for="i in 3" :key="i" class="stat-skeleton">
          <div class="flex items-center gap-2 mb-2">
            <DSkeleton custom-width="32px" custom-height="32px" rounded="rounded-lg" />
            <DSkeleton custom-width="120px" height="3" />
          </div>
          <DSkeleton custom-width="140px" height="8" />
        </div>
      </div>

      <!-- Top Categories Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div v-for="i in 2" :key="i" class="top-category-skeleton">
          <div class="flex items-center gap-2 mb-3">
            <DSkeleton custom-width="24px" custom-height="24px" rounded="rounded-lg" />
            <DSkeleton custom-width="160px" height="3" />
          </div>
          <div class="flex items-center gap-3">
            <DSkeleton custom-width="56px" custom-height="56px" rounded="rounded-xl" />
            <div class="flex-1">
              <DSkeleton custom-width="100px" height="4" class="mb-2" />
              <DSkeleton custom-width="120px" height="4" class="mb-1" />
              <DSkeleton custom-width="80px" height="3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-for="i in 2" :key="i" class="chart-skeleton">
          <div class="flex items-center gap-2 mb-4">
            <DSkeleton custom-width="8px" custom-height="8px" rounded="rounded-full" />
            <DSkeleton custom-width="180px" height="4" />
          </div>

          <!-- Donut Chart Skeleton -->
          <div class="flex items-center justify-center mb-6">
            <DSkeleton custom-width="200px" custom-height="200px" rounded="rounded-full" />
          </div>

          <!-- Legend Skeleton -->
          <div class="space-y-2">
            <div v-for="j in 3" :key="j" class="flex items-center justify-between p-3">
              <div class="flex items-center gap-3">
                <DSkeleton custom-width="16px" custom-height="16px" rounded="rounded-full" />
                <DSkeleton custom-width="24px" custom-height="24px" />
                <DSkeleton custom-width="80px" height="4" />
              </div>
              <div>
                <DSkeleton custom-width="100px" height="4" class="mb-1" />
                <DSkeleton custom-width="40px" height="3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DSkeleton from '../atoms/DSkeleton.vue'
</script>

<style scoped>
.analytics-card-skeleton {
  @apply bg-white dark:bg-gray-800;
}

.stat-skeleton {
  @apply p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700;
}

.top-category-skeleton {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5;
}

.chart-skeleton {
  @apply bg-gray-50 dark:bg-gray-900 rounded-2xl p-5;
}
</style>
