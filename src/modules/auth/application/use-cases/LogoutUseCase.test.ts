import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LogoutUseCase } from './LogoutUseCase'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase
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
    useCase = new LogoutUseCase(mockRepository)
  })

  describe('Successful Logout', () => {
    it('should logout user successfully', async () => {
      vi.mocked(mockRepository.logout).mockResolvedValue()

      await expect(useCase.execute()).resolves.toBeUndefined()
      expect(mockRepository.logout).toHaveBeenCalledOnce()
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      vi.mocked(mockRepository.logout).mockRejectedValue(
        new Error('Logout failed')
      )

      await expect(useCase.execute()).rejects.toThrow('Logout failed')
    })
  })
})
