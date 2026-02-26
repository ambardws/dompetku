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
      placeholder="Minimum 8 characters"
      hint="Use combination of uppercase, lowercase, and numbers"
      required
      :error="errors.password"
      :disabled="loading"
      @blur="validatePassword"
    />

    <!-- Password Strength Indicator -->
    <div v-if="form.password" class="space-y-2 animate-fade-in">
      <div class="flex items-center gap-2">
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300 ease-out"
            :class="strengthBarColor"
            :style="{ width: strengthPercentage + '%' }"
          />
        </div>
        <span class="text-xs font-medium" :class="strengthTextColor">
          {{ strengthText }}
        </span>
      </div>
    </div>

    <!-- Confirm Password Input -->
    <DPasswordInput
      v-model="form.confirmPassword"
      label="Confirm Password"
      placeholder="Re-enter password"
      required
      :error="errors.confirmPassword"
      :disabled="loading"
      @blur="validateConfirmPassword"
    />

    <!-- Error Message -->
    <div
      v-if="generalError"
      class="p-3 rounded-lg bg-red-50 border border-red-200 animate-fade-in"
    >
      <p class="text-sm text-red-600">{{ generalError }}</p>
    </div>

    <!-- Success Message -->
    <div
      v-if="generalSuccess"
      class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 animate-fade-in"
    >
      <p class="text-sm text-emerald-600">{{ generalSuccess }}</p>
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
      {{ loading ? 'Processing...' : 'Create Account' }}
    </DButton>

    <!-- Login Link -->
    <p class="text-center text-sm text-slate-600 dark:text-slate-400">
      Already have an account?
      <a
        href="/login"
        class="text-indigo-700 dark:text-slate-300 hover:text-indigo-800 dark:hover:text-white font-semibold transition-colors"
      >
        Login here
      </a>
    </p>
  </form>
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
const generalSuccess = ref('')
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

const strengthPercentage = computed(() => {
  return (passwordStrength.value / 4) * 100
})

const strengthBarColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-500'
  if (passwordStrength.value === 2) return 'bg-orange-500'
  if (passwordStrength.value === 3) return 'bg-yellow-500'
  return 'bg-emerald-500'
})

const strengthTextColor = computed(() => {
  if (passwordStrength.value <= 1) return 'text-red-600'
  if (passwordStrength.value === 2) return 'text-orange-600'
  if (passwordStrength.value === 3) return 'text-yellow-600'
  return 'text-emerald-600'
})

const strengthText = computed(() => {
  if (passwordStrength.value <= 1) return 'Weak'
  if (passwordStrength.value === 2) return 'Fair'
  if (passwordStrength.value === 3) return 'Strong'
  return 'Very Strong'
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
    errors.value.password = 'Password must contain uppercase letter'
    return false
  }

  if (!/[a-z]/.test(form.value.password)) {
    errors.value.password = 'Password must contain lowercase letter'
    return false
  }

  if (!/[0-9]/.test(form.value.password)) {
    errors.value.password = 'Password must contain a number'
    return false
  }

  return true
}

function validateConfirmPassword() {
  errors.value.confirmPassword = ''

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Password confirmation is required'
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
  generalSuccess.value = ''

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
  setSuccess: (success: string) => {
    generalSuccess.value = success
  },
  reset: () => {
    form.value = { email: '', password: '', confirmPassword: '' }
    errors.value = { email: '', password: '', confirmPassword: '' }
    generalError.value = ''
    generalSuccess.value = ''
    loading.value = false
  },
})
</script>
