/**
 * GetBudgetStatusUseCase
 * Business logic for checking budget status and spending
 */
import type { BudgetRepository } from '../../domain/repositories/BudgetRepository'
import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'
import type { CategoryRepository } from '~modules/categories/domain/repositories/CategoryRepository'
import type { GetBudgetStatusInput, BudgetStatus } from '../../domain/entities/Budget'

export class GetBudgetStatusUseCase {
  constructor(
    private budgetRepository: BudgetRepository,
    private transactionRepository: TransactionRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async execute(input: GetBudgetStatusInput): Promise<BudgetStatus> {
    // Validation
    this.validate(input)

    // Get budget for category
    const budget = await this.budgetRepository.getByCategoryId(input.userId, input.categoryId)
    if (!budget) {
      throw new Error('No budget found for this category')
    }

    // Get category to find the name
    const category = await this.categoryRepository.getById(input.categoryId)
    if (!category) {
      throw new Error('Category not found')
    }

    // Get all expense transactions for this category NAME in the period
    // (since category_id in transactions is null, we match by category name)
    const transactions = await this.transactionRepository.search({
      userId: input.userId,
      query: category.name, // Search by category name
      type: 'expense',
      dateFrom: input.startDate,
      dateTo: input.endDate
    })

    // Calculate total spent
    const spent = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate remaining and percentage
    const remaining = budget.amount - spent
    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

    // Determine status
    let status: 'safe' | 'warning' | 'exceeded'
    if (percentage >= 100) {
      status = 'exceeded'
    } else if (percentage >= 80) {
      status = 'warning'
    } else {
      status = 'safe'
    }

    return {
      budget,
      spent,
      remaining,
      percentage,
      status
    }
  }

  private validate(input: GetBudgetStatusInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!input.categoryId || input.categoryId.trim() === '') {
      throw new Error('Category ID is required')
    }

    if (!input.startDate) {
      throw new Error('Start date is required')
    }

    if (!input.endDate) {
      throw new Error('End date is required')
    }

    if (input.startDate > input.endDate) {
      throw new Error('Start date must be before or equal to end date')
    }
  }
}
