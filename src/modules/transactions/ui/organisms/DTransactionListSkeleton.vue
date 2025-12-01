<template>
  <div class="space-y-4 px-6 py-4">
    <!-- Filter Pills Skeleton -->
    <div class="flex items-center gap-2 mb-4">
      <div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <DSkeleton custom-width="80px" height="8" rounded="rounded-lg" />
        <DSkeleton custom-width="100px" height="8" rounded="rounded-lg" />
        <DSkeleton custom-width="100px" height="8" rounded="rounded-lg" />
      </div>
    </div>

    <!-- Search Input Skeleton -->
    <div class="mb-4">
      <DSkeleton height="10" rounded="rounded-xl" />
    </div>

    <!-- Transaction Rows Skeleton -->
    <div class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <DSkeleton custom-width="48px" custom-height="48px" rounded="rounded-xl" />
          <div>
            <DSkeleton custom-width="120px" height="4" class="mb-2" />
            <DSkeleton custom-width="80px" height="3" />
          </div>
        </div>
        <div class="text-right">
          <DSkeleton custom-width="100px" height="5" class="mb-1" />
          <DSkeleton custom-width="60px" height="3" class="ml-auto" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DSkeleton from '~shared/ui/atoms/DSkeleton.vue'
</script>
