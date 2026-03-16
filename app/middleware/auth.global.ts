import { useAuth } from '~shared/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server-side to avoid SSR issues
  if (process.server) return

  // Define public routes that don't need authentication
  const publicRoutes = ['/login', '/register']

  // If going to a public route, allow it
  if (publicRoutes.includes(to.path)) return

  // Check authentication
  const { user, init } = useAuth()

  // Initialize auth if not already loaded
  if (!user.value) {
    await init()
  }

  // If not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/login', { replace: true })
  }
})
