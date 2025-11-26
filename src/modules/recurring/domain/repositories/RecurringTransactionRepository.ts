/**
 * Recurring Transaction Repository Interface
 */
import type { RecurringTransaction } from '../entities/RecurringTransaction'

export interface RecurringTransactionRepository {
  add(transaction: RecurringTransaction): Promise<void>
  getByUserId(userId: string): Promise<RecurringTransaction[]>
  getActiveByUserId(userId: string): Promise<RecurringTransaction[]>
  getById(id: string): Promise<RecurringTransaction | null>
  update(id: string, transaction: Partial<RecurringTransaction>): Promise<void>
  delete(id: string): Promise<void>
}
