/**
 * SearchTransactionsUseCase
 * Business logic for searching and filtering transactions
 */
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import type { SearchTransactionsInput, Transaction } from '../../domain/entities/Transaction'

export class SearchTransactionsUseCase {
  constructor(private repository: TransactionRepository) {}

  async execute(input: SearchTransactionsInput): Promise<Transaction[]> {
    // Validation
    this.validate(input)

    // Normalize query (trim whitespace)
    const normalizedInput = {
      ...input,
      query: input.query?.trim()
    }

    // Delegate to repository for search
    return await this.repository.search(normalizedInput)
  }

  private validate(input: SearchTransactionsInput): void {
    // Required fields
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    // Optional field validations
    if (input.type !== undefined) {
      if (input.type !== 'income' && input.type !== 'expense') {
        throw new Error('Invalid transaction type')
      }
    }

    if (input.amountMin !== undefined) {
      if (input.amountMin < 0) {
        throw new Error('Amount min must be greater than or equal to 0')
      }
    }

    if (input.amountMax !== undefined) {
      if (input.amountMax < 0) {
        throw new Error('Amount max must be greater than or equal to 0')
      }
    }

    // Range validations
    if (input.amountMin !== undefined && input.amountMax !== undefined) {
      if (input.amountMin > input.amountMax) {
        throw new Error('Amount min cannot be greater than amount max')
      }
    }

    if (input.dateFrom !== undefined && input.dateTo !== undefined) {
      if (input.dateFrom > input.dateTo) {
        throw new Error('Date from cannot be after date to')
      }
    }
  }
}
