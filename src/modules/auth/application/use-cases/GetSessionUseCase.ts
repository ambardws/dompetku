import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type { AuthSession } from '../../domain/entities/User'

/**
 * GetSessionUseCase
 * Retrieves current auth session
 */
export class GetSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthSession | null> {
    return await this.authRepository.getSession()
  }
}
