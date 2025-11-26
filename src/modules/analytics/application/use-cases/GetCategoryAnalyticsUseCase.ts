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

    // Create a map for quick category lookup
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]))

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
          categoryMap,
          'income'
        )
      } else {
        totalExpense += transaction.amount
        this.aggregateTransaction(
          transaction,
          expenseByCategoryMap,
          categoryMap,
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
    categoriesLookup: Map<string, any>,
    type: 'income' | 'expense'
  ): void {
    const categoryId = transaction.categoryId || transaction.category
    const category = categoriesLookup.get(transaction.categoryId!)

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        categoryId: categoryId,
        categoryName: category?.name || transaction.category,
        categoryIcon: category?.icon || '📦',
        categoryColor: category?.color || '#607D8B',
        type: type,
        totalAmount: 0,
        transactionCount: 0,
        percentage: 0,
      })
    }

    const analytics = categoryMap.get(categoryId)!
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
