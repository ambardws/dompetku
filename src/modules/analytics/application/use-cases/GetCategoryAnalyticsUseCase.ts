import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'
import type { CategoryRepository } from '~modules/categories/domain/repositories/CategoryRepository'
import type {
  AnalyticsSummary,
  CategoryAnalytics,
  GetAnalyticsInput,
} from '../../domain/entities/CategoryAnalytics'

/**
 * GetCategoryAnalyticsUseCase
 * Calculates spending/income analytics by category for a given period
 */
export class GetCategoryAnalyticsUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(input: GetAnalyticsInput): Promise<AnalyticsSummary> {
    // Validation
    this.validate(input)

    // Get transactions for the period
    const transactions = await this.transactionRepository.getByPeriod(
      input.userId,
      input.from,
      input.to
    )

    // Get all categories for the user
    const categories = await this.categoryRepository.getByUserId(input.userId)

    // Create maps for quick category lookup (by ID and by name)
    const categoryByIdMap = new Map(categories.map((cat) => [cat.id, cat]))
    const categoryByNameMap = new Map(categories.map((cat) => [cat.name.toLowerCase(), cat]))

    // Calculate totals
    let totalIncome = 0
    let totalExpense = 0

    // Group transactions by category
    const incomeByCategoryMap = new Map<string, CategoryAnalytics>()
    const expenseByCategoryMap = new Map<string, CategoryAnalytics>()

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
        this.aggregateTransaction(
          transaction,
          incomeByCategoryMap,
          categoryByIdMap,
          categoryByNameMap,
          'income'
        )
      } else {
        totalExpense += transaction.amount
        this.aggregateTransaction(
          transaction,
          expenseByCategoryMap,
          categoryByIdMap,
          categoryByNameMap,
          'expense'
        )
      }
    }

    // Calculate percentages
    const incomeByCategory = Array.from(incomeByCategoryMap.values())
    const expenseByCategory = Array.from(expenseByCategoryMap.values())

    this.calculatePercentages(incomeByCategory, totalIncome)
    this.calculatePercentages(expenseByCategory, totalExpense)

    // Sort by amount descending
    incomeByCategory.sort((a, b) => b.totalAmount - a.totalAmount)
    expenseByCategory.sort((a, b) => b.totalAmount - a.totalAmount)

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory,
      topExpenseCategory: expenseByCategory[0],
      topIncomeCategory: incomeByCategory[0],
    }
  }

  private validate(input: GetAnalyticsInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (input.from >= input.to) {
      throw new Error('Invalid date range: from date must be before to date')
    }
  }

  private aggregateTransaction(
    transaction: any,
    categoryMap: Map<string, CategoryAnalytics>,
    categoryByIdMap: Map<string, any>,
    categoryByNameMap: Map<string, any>,
    type: 'income' | 'expense'
  ): void {
    // Try to find category by ID first, then by name
    let category = null
    let categoryKey = ''

    if (transaction.categoryId) {
      // New format: has category_id UUID
      category = categoryByIdMap.get(transaction.categoryId)
      categoryKey = transaction.categoryId
    } else if (transaction.category) {
      // Old format: only has category text
      category = categoryByNameMap.get(transaction.category.toLowerCase())
      categoryKey = category?.id || transaction.category
    }

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        categoryId: categoryKey,
        categoryName: category?.name || transaction.category,
        categoryIcon: category?.icon || '📦',
        categoryColor: category?.color || '#607D8B',
        type: type,
        totalAmount: 0,
        transactionCount: 0,
        percentage: 0,
      })
    }

    const analytics = categoryMap.get(categoryKey)!
    analytics.totalAmount += transaction.amount
    analytics.transactionCount += 1
  }

  private calculatePercentages(
    analytics: CategoryAnalytics[],
    total: number
  ): void {
    if (total === 0) return

    for (const item of analytics) {
      item.percentage = Math.round((item.totalAmount / total) * 100)
    }
  }
}
