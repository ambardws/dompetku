/**
 * User Entity
 * Core domain model untuk user
 */
export interface User {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Auth Session
 * Represents current authenticated session
 */
export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Register Input
 */
export interface RegisterInput {
  email: string
  password: string
}

/**
 * Login Input
 */
export interface LoginInput {
  email: string
  password: string
}

/**
 * Auth Result
 * Generic result untuk auth operations
 */
export interface AuthResult {
  success: boolean
  session?: AuthSession
  error?: string
}
