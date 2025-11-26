<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
    <div class="w-full max-w-md">
      <!-- Logo & Title -->
      <div class="text-center mb-8 animate-fade-in">
        <h1 class="text-4xl font-bold text-primary-600 mb-2">💰 Dompetku</h1>
        <p class="text-gray-600">Kelola keuangan dengan mudah</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Login</h2>

        <DLoginForm
          ref="loginFormRef"
          @submit="handleLogin"
        />
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-500 mt-6">
        © 2025 Dompetku. Built with Clean Architecture & Vibecoding ✨
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DLoginForm from '~modules/auth/ui/organisms/DLoginForm.vue'
import type { LoginInput } from '~modules/auth/domain/entities/User'
import { useAuth } from '~shared/composables/useAuth'

definePageMeta({
  layout: false, // No layout untuk auth pages
})

const loginFormRef = ref<InstanceType<typeof DLoginForm> | null>(null)
const { login } = useAuth()
const router = useRouter()

async function handleLogin(data: LoginInput) {
  if (!loginFormRef.value) return

  loginFormRef.value.setLoading(true)

  try {
    const result = await login(data)

    if (result.success) {
      // Redirect to dashboard
      await router.push('/')
    } else {
      loginFormRef.value.setLoading(false)
      loginFormRef.value.setError(result.error || 'Login failed')
    }
  } catch (error) {
    loginFormRef.value.setLoading(false)
    loginFormRef.value.setError(error instanceof Error ? error.message : 'Login failed')
  }
}
</script>

<style scoped>
/* Add any page-specific styles here if needed */
</style>
