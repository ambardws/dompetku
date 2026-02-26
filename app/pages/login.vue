<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="w-full max-w-md">
      <!-- Logo & Title -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-2">Dompetku</h1>
        <p class="text-slate-500">Kelola keuangan dengan cerdas</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-xl shadow-lg border border-slate-100 p-8 animate-slide-up">
        <h2 class="text-xl font-semibold text-slate-800 mb-6">Login</h2>

        <DLoginForm
          ref="loginFormRef"
          @submit="handleLogin"
        />
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-400 mt-8">
        © 2025 Dompetku by Ambar Dwi Saputra
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
