<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <DToastContainer />
  </div>
</template>

<script setup>
import DToastContainer from '~shared/ui/organisms/DToastContainer.vue'

useHead({
  titleTemplate: '%s - Dompetku',
  htmlAttrs: {
    lang: 'id'
  }
})
</script>
