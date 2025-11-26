import type { AuthResult, LoginInput, RegisterInput, AuthSession, User } from '../entities/User'

/**
 * Auth Repository Interface
 * Contract untuk auth operations - tidak peduli implementasinya (Supabase, Firebase, dll)
 */
export interface AuthRepository {
  /**
   * Register user baru
   */
  register(input: RegisterInput): Promise<AuthResult>

  /**
   * Login dengan email & password
   */
  login(input: LoginInput): Promise<AuthResult>

  /**
   * Logout user
   */
  logout(): Promise<void>

  /**
   * Get current session
   */
  getSession(): Promise<AuthSession | null>

  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null>

  /**
   * Refresh session
   */
  refreshSession(): Promise<AuthResult>

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>
}
