/**
 * CreateRecurringTransactionUseCase
 * Business logic for creating recurring transaction templates
 */
import type { RecurringTransactionRepository } from '../../domain/repositories/RecurringTransactionRepository'
import type { CreateRecurringTransactionInput, RecurringTransaction } from '../../domain/entities/RecurringTransaction'
import { nanoid } from 'nanoid'

export class CreateRecurringTransactionUseCase {
  constructor(private repository: RecurringTransactionRepository) {}

  async execute(input: CreateRecurringTransactionInput): Promise<RecurringTransaction> {
    // Validation
    this.validate(input)

    // Create recurring transaction template
    const recurringTransaction: RecurringTransaction = {
      id: nanoid(),
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      categoryId: input.categoryId,
      note: input.note,
      frequency: input.frequency,
      startDate: input.startDate,
      nextDate: input.startDate, // Initially same as start date
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.repository.add(recurringTransaction)

    return recurringTransaction
  }

  private validate(input: CreateRecurringTransactionInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (input.type !== 'income' && input.type !== 'expense') {
      throw new Error('Invalid transaction type')
    }

    if (input.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (!input.category || input.category.trim() === '') {
      throw new Error('Category is required')
    }

    if (!['daily', 'weekly', 'monthly'].includes(input.frequency)) {
      throw new Error('Invalid frequency')
    }
  }
}
