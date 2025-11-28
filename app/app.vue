<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <DToastContainer />
    <DConfirmDialogContainer />
  </div>
</template>

<script setup>
import DToastContainer from '~shared/ui/organisms/DToastContainer.vue'
import DConfirmDialogContainer from '~shared/ui/organisms/DConfirmDialogContainer.vue'

useHead({
  titleTemplate: '%s - Dompetku',
  htmlAttrs: {
    lang: 'id'
  }
})
</script>
