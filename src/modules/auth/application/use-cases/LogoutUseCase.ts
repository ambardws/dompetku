import type { AuthRepository } from '../../domain/repositories/AuthRepository'

/**
 * LogoutUseCase
 * Handles user logout
 */
export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout()
  }
}
