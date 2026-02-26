<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
    <div class="w-full max-w-md">
      <!-- Logo & Title -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-700 dark:bg-slate-800 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">Dompetku</h1>
        <p class="text-slate-500 dark:text-slate-400">Start your financial journey</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 animate-slide-up">
        <h2 class="text-xl font-semibold text-slate-800 dark:text-white mb-6">Create Account</h2>

        <DRegisterForm
          ref="registerFormRef"
          @submit="handleRegister"
        />
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
        © 2025 Dompetku by Ambar Dwi Saputra
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DRegisterForm from '~modules/auth/ui/organisms/DRegisterForm.vue'
import type { RegisterInput } from '~modules/auth/domain/entities/User'
import { useAuth } from '~shared/composables/useAuth'

definePageMeta({
  layout: false, // No layout untuk auth pages
  // middleware: 'guest', // Redirect if already authenticated
})

const registerFormRef = ref<InstanceType<typeof DRegisterForm> | null>(null)
const { register } = useAuth()
const router = useRouter()

async function handleRegister(data: RegisterInput) {
  if (!registerFormRef.value) return

  registerFormRef.value.setLoading(true)

  try {
    const result = await register(data)

    if (result.success) {
      if (result.emailConfirmationRequired) {
        // Show success message for email confirmation
        registerFormRef.value.setSuccess('Registration successful! Please check your email to confirm your account.')
        registerFormRef.value.setLoading(false)
      } else {
        // Redirect to dashboard if session is created
        await router.push('/')
      }
    } else {
      registerFormRef.value.setLoading(false)
      registerFormRef.value.setError(result.error || 'Registration failed')
    }
  } catch (error) {
    registerFormRef.value.setLoading(false)
    registerFormRef.value.setError('Registration error: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}
</script>

<style scoped>
/* Add any page-specific styles here if needed */
</style>