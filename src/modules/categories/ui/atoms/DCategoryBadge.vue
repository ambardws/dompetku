<template>
  <span
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
    :style="{ backgroundColor: `${color}20`, color: color }"
  >
    <span class="text-base">{{ icon }}</span>
    <span>{{ name }}</span>
  </span>
</template>

<script setup lang="ts">
interface Props {
  name: string
  icon: string
  color: string
}

defineProps<Props>()
</script>
