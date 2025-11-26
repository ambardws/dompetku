import { ref, computed } from 'vue'
import { RegisterUseCase } from '~modules/auth/application/use-cases/RegisterUseCase'
import { LoginUseCase } from '~modules/auth/application/use-cases/LoginUseCase'
import { LogoutUseCase } from '~modules/auth/application/use-cases/LogoutUseCase'
import { GetSessionUseCase } from '~modules/auth/application/use-cases/GetSessionUseCase'
import type { AuthSession, RegisterInput, LoginInput } from '~modules/auth/domain/entities/User'
import { useAuthRepository } from '~shared/composables/useAuthRepository'

/**
 * Auth State Management Composable
 * Provides reactive auth state and methods
 */
export function useAuth() {
  const repository = useAuthRepository()
  // Use useState to share state across all components
  const session = useState<AuthSession | null>('auth-session', () => null)
  const loading = useState<boolean>('auth-loading', () => false)
  const error = useState<string | null>('auth-error', () => null)

  // Use cases
  const registerUseCase = new RegisterUseCase(repository)
  const loginUseCase = new LoginUseCase(repository)
  const logoutUseCase = new LogoutUseCase(repository)
  const getSessionUseCase = new GetSessionUseCase(repository)

  // Computed
  const isAuthenticated = computed(() => session.value !== null)
  const user = computed(() => session.value?.user ?? null)

  /**
   * Initialize auth - load session
   */
  async function init() {
    try {
      loading.value = true
      session.value = await getSessionUseCase.execute()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize auth'
    } finally {
      loading.value = false
    }
  }

  /**
   * Register new user
   */
  async function register(input: RegisterInput) {
    try {
      loading.value = true
      error.value = null

      const result = await registerUseCase.execute(input)

      if (result.success && result.session) {
        session.value = result.session
        return { success: true }
      }

      error.value = result.error || 'Registration failed'
      return { success: false, error: error.value }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Login user
   */
  async function login(input: LoginInput) {
    try {
      loading.value = true
      error.value = null

      const result = await loginUseCase.execute(input)

      if (result.success && result.session) {
        session.value = result.session
        return { success: true }
      }

      error.value = result.error || 'Login failed'
      return { success: false, error: error.value }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      loading.value = true
      error.value = null

      await logoutUseCase.execute()
      session.value = null

      return { success: true }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Logout failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh session
   */
  async function refreshSession() {
    try {
      session.value = await getSessionUseCase.execute()
    } catch (e) {
      console.error('Failed to refresh session:', e)
      session.value = null
    }
  }

  return {
    // State
    session,
    loading,
    error,
    isAuthenticated,
    user,

    // Methods
    init,
    register,
    login,
    logout,
    refreshSession,
  }
}
