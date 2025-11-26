import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterUseCase } from './RegisterUseCase'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type { RegisterInput, AuthResult } from '../../domain/entities/User'

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase
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
    useCase = new RegisterUseCase(mockRepository)
  })

  describe('Validation', () => {
    it('should reject empty email', async () => {
      const input: RegisterInput = {
        email: '',
        password: 'Password123!',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Email is required')
    })

    it('should reject invalid email format', async () => {
      const input: RegisterInput = {
        email: 'invalid-email',
        password: 'Password123!',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid email format')
    })

    it('should reject empty password', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: '',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Password is required')
    })

    it('should reject password shorter than 8 characters', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'Pass1!',
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Password must be at least 8 characters'
      )
    })

    it('should reject password without uppercase letter', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'password123!',
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Password must contain at least one uppercase letter'
      )
    })

    it('should reject password without lowercase letter', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'PASSWORD123!',
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Password must contain at least one lowercase letter'
      )
    })

    it('should reject password without number', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'Password!',
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Password must contain at least one number'
      )
    })
  })

  describe('Successful Registration', () => {
    it('should register user with valid input', async () => {
      const input: RegisterInput = {
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

      vi.mocked(mockRepository.register).mockResolvedValue(mockResult)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.session?.user.email).toBe('test@example.com')
      expect(mockRepository.register).toHaveBeenCalledWith(input)
    })

    it('should normalize email to lowercase', async () => {
      const input: RegisterInput = {
        email: 'Test@EXAMPLE.com',
        password: 'Password123!',
      }

      const mockResult: AuthResult = {
        success: true,
      }

      vi.mocked(mockRepository.register).mockResolvedValue(mockResult)

      await useCase.execute(input)

      expect(mockRepository.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      vi.mocked(mockRepository.register).mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(useCase.execute(input)).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should return error result when email already exists', async () => {
      const input: RegisterInput = {
        email: 'existing@example.com',
        password: 'Password123!',
      }

      const mockResult: AuthResult = {
        success: false,
        error: 'Email already registered',
      }

      vi.mocked(mockRepository.register).mockResolvedValue(mockResult)

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already registered')
    })
  })
})
