import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type { LoginInput, AuthResult } from '../../domain/entities/User'

/**
 * LoginUseCase
 * Handles user login dengan validation
 */
export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    // Validation
    this.validate(input)

    // Normalize email
    const normalizedInput: LoginInput = {
      ...input,
      email: input.email.toLowerCase().trim(),
    }

    // Call repository
    return await this.authRepository.login(normalizedInput)
  }

  private validate(input: LoginInput): void {
    // Email validation
    if (!input.email || input.email.trim() === '') {
      throw new Error('Email is required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format')
    }

    // Password validation
    if (!input.password || input.password === '') {
      throw new Error('Password is required')
    }
  }
}
