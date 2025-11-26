import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import type { RegisterInput, AuthResult } from '../../domain/entities/User'

/**
 * RegisterUseCase
 * Handles user registration dengan validation
 */
export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    // Validation
    this.validate(input)

    // Normalize email
    const normalizedInput: RegisterInput = {
      ...input,
      email: input.email.toLowerCase().trim(),
    }

    // Call repository
    return await this.authRepository.register(normalizedInput)
  }

  private validate(input: RegisterInput): void {
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

    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    if (!/[A-Z]/.test(input.password)) {
      throw new Error('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(input.password)) {
      throw new Error('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(input.password)) {
      throw new Error('Password must contain at least one number')
    }
  }
}
