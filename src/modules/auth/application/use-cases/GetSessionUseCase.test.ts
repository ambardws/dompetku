import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetSessionUseCase } from './GetSessionUseCase'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type { AuthSession } from '../../domain/entities/User'

describe('GetSessionUseCase', () => {
  let useCase: GetSessionUseCase
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
    useCase = new GetSessionUseCase(mockRepository)
  })

  describe('Get Session', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession: AuthSession = {
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Date.now() + 3600000,
      }

      vi.mocked(mockRepository.getSession).mockResolvedValue(mockSession)

      const result = await useCase.execute()

      expect(result).toEqual(mockSession)
      expect(mockRepository.getSession).toHaveBeenCalledOnce()
    })

    it('should return null when user is not authenticated', async () => {
      vi.mocked(mockRepository.getSession).mockResolvedValue(null)

      const result = await useCase.execute()

      expect(result).toBeNull()
      expect(mockRepository.getSession).toHaveBeenCalledOnce()
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      vi.mocked(mockRepository.getSession).mockRejectedValue(
        new Error('Session retrieval failed')
      )

      await expect(useCase.execute()).rejects.toThrow('Session retrieval failed')
    })
  })
})
