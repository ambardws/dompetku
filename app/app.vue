<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <DToastContainer />
    <DConfirmDialogContainer />
    <DBottomNav v-if="!isAuthPage" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import DToastContainer from '~shared/ui/organisms/DToastContainer.vue'
import DConfirmDialogContainer from '~shared/ui/organisms/DConfirmDialogContainer.vue'
import DBottomNav from '~shared/ui/organisms/DBottomNav.vue'
import { useSharedHeaderProvider } from '~shared/composables/useSharedHeader'

useHead({
  titleTemplate: '%s - Dompetku',
  htmlAttrs: {
    lang: 'id'
  }
})

// Provide shared header handlers to all pages
useSharedHeaderProvider()

// Hide bottom nav on login and register pages
const route = useRoute()
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

// Smooth fade-in when mounted
onMounted(() => {
  setTimeout(() => {
    document.getElementById('__nuxt')?.classList.add('vue-mounted')
  }, 50)
})
</script>

<style>
/* Prevent FOUC - Smooth fade-in */
#__nuxt {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

#__nuxt.vue-mounted {
  opacity: 1;
}
</style>