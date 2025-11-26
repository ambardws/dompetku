/**
 * Get Transactions By Period Use Case
 * Retrieves transactions for a specific time period
 */
import type { Transaction } from '../../domain/entities/Transaction'
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'

export interface GetTransactionsByPeriodInput {
  userId: string
  from: Date
  to: Date
}

export class GetTransactionsByPeriodUseCase {
  constructor(private repository: TransactionRepository) {}

  async execute(input: GetTransactionsByPeriodInput): Promise<Transaction[]> {
    this.validate(input)

    const transactions = await this.repository.getByPeriod(
      input.userId,
      input.from,
      input.to
    )

    // Sort by date descending (newest first)
    return transactions.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  private validate(input: GetTransactionsByPeriodInput): void {
    if (!input.userId) {
      throw new Error('User ID is required')
    }

    if (!input.from || !input.to) {
      throw new Error('Date range is required')
    }

    if (input.from > input.to) {
      throw new Error('Start date must be before end date')
    }
  }
}
