/**
 * Add Transaction Use Case
 * Business logic for creating a new transaction
 */
import type { Transaction, CreateTransactionInput } from '../../domain/entities/Transaction'
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'

export class AddTransactionUseCase {
  constructor(private repository: TransactionRepository) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    // Validation
    this.validate(input)

    // Map to entity
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      note: input.note,
      createdAt: new Date()
    }

    // Save to repository
    await this.repository.add(transaction)

    return transaction
  }

  private validate(input: CreateTransactionInput): void {
    if (!input.userId) {
      throw new Error('User ID is required')
    }

    if (!input.type || !['income', 'expense'].includes(input.type)) {
      throw new Error('Invalid transaction type')
    }

    if (!input.amount || input.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (!input.category || input.category.trim() === '') {
      throw new Error('Category is required')
    }
  }
}
