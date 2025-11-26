<template>
  <div class="d-register-form">
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Email Input -->
      <DTextInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="nama@example.com"
        required
        :error="errors.email"
        :disabled="loading"
        @blur="validateEmail"
      />

      <!-- Password Input -->
      <DPasswordInput
        v-model="form.password"
        label="Password"
        placeholder="Min. 8 karakter, huruf besar, kecil, dan angka"
        hint="Password harus minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka"
        required
        :error="errors.password"
        :disabled="loading"
        @blur="validatePassword"
      />

      <!-- Confirm Password Input -->
      <DPasswordInput
        v-model="form.confirmPassword"
        label="Konfirmasi Password"
        placeholder="Masukkan ulang password"
        required
        :error="errors.confirmPassword"
        :disabled="loading"
        @blur="validateConfirmPassword"
      />

      <!-- Password Strength Indicator -->
      <div v-if="form.password" class="space-y-2 animate-fade-in">
        <div class="flex gap-1">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1 flex-1 rounded-full transition-all"
            :class="i <= passwordStrength ? strengthColor : 'bg-gray-200'"
          />
        </div>
        <p class="text-xs" :class="strengthTextColor">
          {{ strengthText }}
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="generalError"
        class="p-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in"
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
        {{ loading ? 'Mendaftar...' : 'Daftar' }}
      </DButton>

      <!-- Login Link -->
      <p class="text-center text-sm text-gray-600">
        Sudah punya akun?
        <a
          href="/login"
          class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          Login di sini
        </a>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DTextInput from '~modules/transactions/ui/atoms/DTextInput.vue'
import DPasswordInput from '~modules/auth/ui/molecules/DPasswordInput.vue'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'
import type { RegisterInput } from '~modules/auth/domain/entities/User'

interface Emits {
  (e: 'submit', data: RegisterInput): void
}

const emit = defineEmits<Emits>()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const generalError = ref('')
const loading = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.email.trim() !== '' &&
    form.value.password !== '' &&
    form.value.confirmPassword !== '' &&
    form.value.password === form.value.confirmPassword &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword
  )
})

// Password Strength
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++

  return strength
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-500'
  if (passwordStrength.value === 2) return 'bg-orange-500'
  if (passwordStrength.value === 3) return 'bg-yellow-500'
  return 'bg-green-500'
})

const strengthTextColor = computed(() => {
  if (passwordStrength.value <= 1) return 'text-red-600'
  if (passwordStrength.value === 2) return 'text-orange-600'
  if (passwordStrength.value === 3) return 'text-yellow-600'
  return 'text-green-600'
})

const strengthText = computed(() => {
  if (passwordStrength.value <= 1) return 'Password lemah'
  if (passwordStrength.value === 2) return 'Password cukup'
  if (passwordStrength.value === 3) return 'Password kuat'
  return 'Password sangat kuat'
})

function validateEmail() {
  errors.value.email = ''

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
    return false
  }

  return true
}

function validatePassword() {
  errors.value.password = ''

  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return false
  }

  if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
    return false
  }

  if (!/[A-Z]/.test(form.value.password)) {
    errors.value.password = 'Password must contain at least one uppercase letter'
    return false
  }

  if (!/[a-z]/.test(form.value.password)) {
    errors.value.password = 'Password must contain at least one lowercase letter'
    return false
  }

  if (!/[0-9]/.test(form.value.password)) {
    errors.value.password = 'Password must contain at least one number'
    return false
  }

  return true
}

function validateConfirmPassword() {
  errors.value.confirmPassword = ''

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    return false
  }

  return true
}

function handleSubmit() {
  generalError.value = ''

  // Validate all fields
  const emailValid = validateEmail()
  const passwordValid = validatePassword()
  const confirmPasswordValid = validateConfirmPassword()

  if (!emailValid || !passwordValid || !confirmPasswordValid) {
    return
  }

  const registerInput: RegisterInput = {
    email: form.value.email,
    password: form.value.password,
  }

  emit('submit', registerInput)
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
    form.value = { email: '', password: '', confirmPassword: '' }
    errors.value = { email: '', password: '', confirmPassword: '' }
    generalError.value = ''
    loading.value = false
  },
})
</script>

<style scoped>
.d-register-form {
  @apply w-full;
}
</style>
