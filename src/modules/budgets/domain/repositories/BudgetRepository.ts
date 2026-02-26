/**
 * Budget Repository Interface
 * Defines contract for budget data access operations
 */
import type { Budget } from '../entities/Budget'

export interface BudgetRepository {
  add(budget: Budget): Promise<Budget>
  getByUserId(userId: string): Promise<Budget[]>
  getByCategoryId(userId: string, categoryId: string): Promise<Budget | null>
  getById(id: string): Promise<Budget | null>
  update(id: string, budget: Partial<Budget>): Promise<void>
  delete(id: string): Promise<void>
}
