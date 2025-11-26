/**
 * Category Analytics Entity
 * Represents spending/income analysis by category
 */
export interface CategoryAnalytics {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  type: 'income' | 'expense'
  totalAmount: number
  transactionCount: number
  percentage: number
}

/**
 * Analytics Summary
 */
export interface AnalyticsSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  incomeByCategory: CategoryAnalytics[]
  expenseByCategory: CategoryAnalytics[]
  topExpenseCategory?: CategoryAnalytics
  topIncomeCategory?: CategoryAnalytics
}

/**
 * Get Analytics Input
 */
export interface GetAnalyticsInput {
  userId: string
  from: Date
  to: Date
}
