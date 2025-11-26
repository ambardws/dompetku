import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type {
  AuthResult,
  LoginInput,
  RegisterInput,
  AuthSession,
  User,
} from '../../domain/entities/User'

/**
 * Supabase Auth Repository Implementation
 */
export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: input.email,
        password: input.password,
      })

      console.log('Supabase register data:', data, 'error:', error)

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      if (!data.session && !data.user) {
        return {
          success: false,
          error: 'Registration failed - no session created',
        }
      }

      return {
        success: true,
        session: this.mapToAuthSession(data.session, data.user),
      }
    } catch (error) {
      throw new Error(
        `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      console.log('Supabase login data:', data, 'error:', error)

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      if (!data.session || !data.user) {
        return {
          success: false,
          error: 'Login failed - no session created',
        }
      }

      return {
        success: true,
        session: this.mapToAuthSession(data.session, data.user),
      }
    } catch (error) {
      throw new Error(
        `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(`Logout error: ${error.message}`)
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()

    if (!session) {
      return null
    }

    return this.mapToAuthSession(session, session.user)
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return null
    }

    return this.mapToUser(user)
  }

  async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      if (!data.session || !data.user) {
        return {
          success: false,
          error: 'Session refresh failed',
        }
      }

      return {
        success: true,
        session: this.mapToAuthSession(data.session, data.user),
      }
    } catch (error) {
      throw new Error(
        `Refresh session error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return session !== null
  }

  /**
   * Helper: Map Supabase session to AuthSession
   */
  private mapToAuthSession(session: any, user: any): AuthSession {
    return {
      user: this.mapToUser(user),
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
    }
  }

  /**
   * Helper: Map Supabase user to User entity
   */
  private mapToUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }
  }
}
