import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginUseCase } from './LoginUseCase'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type { LoginInput, AuthResult } from '../../domain/entities/User'

describe('LoginUseCase', () => {
  let useCase: LoginUseCase
  let mockRepository: AuthRepository

  beforeEach(() => {
    mockRepository = {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      getSession: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshSession: vi.fn(),
      isAuthenticated: vi.fn(),
    }
    useCase = new LoginUseCase(mockRepository)
  })

  describe('Validation', () => {
    it('should reject empty email', async () => {
      const input: LoginInput = {
        email: '',
        password: 'Password123!',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Email is required')
    })

    it('should reject invalid email format', async () => {
      const input: LoginInput = {
        email: 'invalid-email',
        password: 'Password123!',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid email format')
    })

    it('should reject empty password', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: '',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Password is required')
    })
  })

  describe('Successful Login', () => {
    it('should login user with valid credentials', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      const mockResult: AuthResult = {
        success: true,
        session: {
          user: {
            id: '123',
            email: 'test@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresAt: Date.now() + 3600000,
        },
      }

      vi.mocked(mockRepository.login).mockResolvedValue(mockResult)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.session?.user.email).toBe('test@example.com')
      expect(mockRepository.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      })
    })

    it('should normalize email to lowercase', async () => {
      const input: LoginInput = {
        email: 'Test@EXAMPLE.com',
        password: 'Password123!',
      }

      const mockResult: AuthResult = {
        success: true,
      }

      vi.mocked(mockRepository.login).mockResolvedValue(mockResult)

      await useCase.execute(input)

      expect(mockRepository.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid credentials', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      }

      const mockResult: AuthResult = {
        success: false,
        error: 'Invalid credentials',
      }

      vi.mocked(mockRepository.login).mockResolvedValue(mockResult)

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('should handle repository errors', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      vi.mocked(mockRepository.login).mockRejectedValue(
        new Error('Network error')
      )

      await expect(useCase.execute(input)).rejects.toThrow('Network error')
    })
  })
})
