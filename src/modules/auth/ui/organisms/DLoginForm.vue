<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- Email Input -->
    <DTextInput
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="nama@email.com"
      required
      :error="errors.email"
      :disabled="loading"
      @blur="validateEmail"
    />

    <!-- Password Input -->
    <DPasswordInput
      v-model="form.password"
      label="Password"
      placeholder="Masukkan password"
      required
      :error="errors.password"
      :disabled="loading"
      @blur="validatePassword"
    />

    <!-- Error Message -->
    <div
      v-if="generalError"
      class="p-3 rounded-lg bg-red-50 border border-red-200 animate-fade-in"
    >
      <p class="text-sm text-red-600">{{ generalError }}</p>
    </div>

    <!-- Submit Button -->
    <DButton
      type="submit"
      variant="primary"
      size="lg"
      :loading="loading"
      :disabled="!isFormValid"
      class="w-full"
    >
      {{ loading ? 'Memproses...' : 'Login' }}
    </DButton>

    <!-- Register Link -->
    <p class="text-center text-sm text-slate-600">
      Belum punya akun?
      <a
        href="/register"
        class="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
      >
        Daftar sekarang
      </a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DTextInput from '~modules/transactions/ui/atoms/DTextInput.vue'
import DPasswordInput from '~modules/auth/ui/molecules/DPasswordInput.vue'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'
import type { LoginInput } from '~modules/auth/domain/entities/User'

interface Emits {
  (e: 'submit', data: LoginInput): void
}

const emit = defineEmits<Emits>()

const form = ref<LoginInput>({
  email: '',
  password: '',
})

const errors = ref({
  email: '',
  password: '',
})

const generalError = ref('')
const loading = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.email.trim() !== '' &&
    form.value.password !== '' &&
    !errors.value.email &&
    !errors.value.password
  )
})

function validateEmail() {
  errors.value.email = ''

  if (!form.value.email.trim()) {
    errors.value.email = 'Email wajib diisi'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Format email tidak valid'
    return false
  }

  return true
}

function validatePassword() {
  errors.value.password = ''

  if (!form.value.password) {
    errors.value.password = 'Password wajib diisi'
    return false
  }

  return true
}

function handleSubmit() {
  generalError.value = ''

  // Validate all fields
  const emailValid = validateEmail()
  const passwordValid = validatePassword()

  if (!emailValid || !passwordValid) {
    return
  }

  emit('submit', form.value)
}

// Expose loading and error state for parent component
defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value
  },
  setError: (error: string) => {
    generalError.value = error
  },
  reset: () => {
    form.value = { email: '', password: '' }
    errors.value = { email: '', password: '' }
    generalError.value = ''
    loading.value = false
  },
})
</script>
