<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <NuxtRouteAnnouncer />

    <!-- Loading state while checking auth -->
    <div v-if="isAuthChecking" class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>

    <!-- Main content with max-width wrapper -->
    <template v-else>
      <div class="w-full max-w-3xl mx-auto">
        <NuxtPage />
      </div>
      <DToastContainer />
      <DConfirmDialogContainer />
      <DBottomNav v-if="!isAuthPage" />
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DToastContainer from '~shared/ui/organisms/DToastContainer.vue'
import DConfirmDialogContainer from '~shared/ui/organisms/DConfirmDialogContainer.vue'
import DBottomNav from '~shared/ui/organisms/DBottomNav.vue'
import { useSharedHeaderProvider } from '~shared/composables/useSharedHeader'
import { useAuth } from '~shared/composables/useAuth'

useHead({
  titleTemplate: '%s - Dompetku',
  htmlAttrs: {
    lang: 'id'
  }
})

// Provide shared header handlers to all pages
useSharedHeaderProvider()

// Auth state
const { init, user } = useAuth()
const isAuthChecking = ref(true)

// Public routes that don't need auth check delay
const publicRoutes = ['/login', '/register']

// Hide bottom nav on login and register pages
const route = useRoute()
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

// Initialize auth on app mount
onMounted(async () => {
  // If on public route, skip auth check delay
  if (publicRoutes.includes(route.path)) {
    isAuthChecking.value = false
    return
  }

  // Check auth status
  if (!user.value) {
    await init()
  }

  isAuthChecking.value = false
})
</script>