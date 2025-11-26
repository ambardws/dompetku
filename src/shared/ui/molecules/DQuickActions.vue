<template>
  <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
    <div class="flex gap-2 flex-wrap">
      <slot />
    </div>

    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
// Simple container component for quick actions
</script>
