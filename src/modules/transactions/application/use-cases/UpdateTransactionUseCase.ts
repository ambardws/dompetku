/**
 * UpdateTransactionUseCase
 * Business logic for updating existing transactions
 */
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import type { UpdateTransactionInput, Transaction } from '../../domain/entities/Transaction'

export class UpdateTransactionUseCase {
  constructor(private repository: TransactionRepository) {}

  async execute(input: UpdateTransactionInput): Promise<void> {
    // Validation
    this.validate(input)

    // Check if transaction exists
    const existingTransaction = await this.repository.getById(input.id)
    if (!existingTransaction) {
      throw new Error('Transaction not found')
    }

    // Authorization check
    if (existingTransaction.userId !== input.userId) {
      throw new Error('Unauthorized to update this transaction')
    }

    // Build update object (only include fields that are being updated)
    const updates: Partial<Transaction> = {}

    if (input.type !== undefined) {
      updates.type = input.type
    }

    if (input.amount !== undefined) {
      updates.amount = input.amount
    }

    if (input.category !== undefined) {
      updates.category = input.category
    }

    if (input.categoryId !== undefined) {
      updates.categoryId = input.categoryId
    }

    if (input.note !== undefined) {
      updates.note = input.note
    }

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update')
    }

    // Update transaction
    await this.repository.update(input.id, updates)
  }

  private validate(input: UpdateTransactionInput): void {
    // Required fields
    if (!input.id || input.id.trim() === '') {
      throw new Error('Transaction ID is required')
    }

    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    // Optional field validations (only validate if provided)
    if (input.type !== undefined) {
      if (input.type !== 'income' && input.type !== 'expense') {
        throw new Error('Invalid transaction type')
      }
    }

    if (input.amount !== undefined) {
      if (input.amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }
    }

    if (input.category !== undefined) {
      if (input.category.trim() === '') {
        throw new Error('Category cannot be empty')
      }
    }
  }
}
