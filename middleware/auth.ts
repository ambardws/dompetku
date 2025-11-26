/**
 * Auth Middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, init } = useAuth()

  // Initialize auth session
  await init()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
