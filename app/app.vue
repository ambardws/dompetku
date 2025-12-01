<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <DToastContainer />
    <DConfirmDialogContainer />
    <DBottomNav />
  </div>
</template>

<script setup>
import DToastContainer from '~shared/ui/organisms/DToastContainer.vue'
import DConfirmDialogContainer from '~shared/ui/organisms/DConfirmDialogContainer.vue'
import DBottomNav from '~shared/ui/organisms/DBottomNav.vue'

useHead({
  titleTemplate: '%s - Dompetku',
  htmlAttrs: {
    lang: 'id'
  }
})
</script>
