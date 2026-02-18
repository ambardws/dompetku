/**
 * Auth Middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  if (!user.value) {
    return navigateTo('/login')
  }
})
