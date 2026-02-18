/**
 * Guest Middleware
 * Redirects authenticated users away from auth pages (login, register)
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  // If already authenticated, redirect to dashboard
  if (user.value) {
    return navigateTo('/')
  }
})
