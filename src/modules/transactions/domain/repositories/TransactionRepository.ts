/**
 * Transaction Repository Interface
 * Defines contract for data access operations
 */
import type { Transaction, SearchTransactionsInput } from '../entities/Transaction'

export interface TransactionRepository {
  add(transaction: Transaction): Promise<void>
  getByPeriod(userId: string, from: Date, to: Date): Promise<Transaction[]>
  getById(id: string): Promise<Transaction | null>
  delete(id: string): Promise<void>
  update(id: string, transaction: Partial<Transaction>): Promise<void>
  search(input: SearchTransactionsInput): Promise<Transaction[]>
}
