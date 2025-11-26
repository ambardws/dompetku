/**
 * Guest Middleware
 * Redirects authenticated users away from auth pages (login, register)
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, init } = useAuth()

  // Initialize auth session
  await init()

  // If already authenticated, redirect to dashboard
  if (isAuthenticated.value) {
    return navigateTo('/')
  }
})
