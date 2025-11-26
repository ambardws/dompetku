<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
    <div class="w-full max-w-md">
      <!-- Logo & Title -->
      <div class="text-center mb-8 animate-fade-in">
        <h1 class="text-4xl font-bold text-primary-600 mb-2">💰 Dompetku</h1>
        <p class="text-gray-600">Mulai kelola keuanganmu hari ini</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Daftar Akun Baru</h2>

        <DRegisterForm
          ref="registerFormRef"
          @submit="handleRegister"
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

  const result = await register(data)

  if (result.success) {
    // Redirect to dashboard
    await router.push('/')
  } else {
    registerFormRef.value.setLoading(false)
    registerFormRef.value.setError(result.error || 'Registration failed')
  }
}
</script>

<style scoped>
/* Add any page-specific styles here if needed */
</style>
