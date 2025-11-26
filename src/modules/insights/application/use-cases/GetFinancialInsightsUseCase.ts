/**
 * GetFinancialInsightsUseCase
 * Business logic for generating financial insights and recommendations
 */
import type { TransactionRepository } from '../../../transactions/domain/repositories/TransactionRepository'
import type {
  GetFinancialInsightsInput,
  FinancialInsight,
  Insight,
  Recommendation
} from '../../domain/entities/FinancialInsight'

export class GetFinancialInsightsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(input: GetFinancialInsightsInput): Promise<FinancialInsight> {
    // Validation
    this.validate(input)

    // Calculate date range based on period
    const { startDate, endDate } = this.getDateRange(input.period)

    // Get transactions for the period
    const transactions = await this.transactionRepository.getByPeriod(
      input.userId,
      startDate,
      endDate
    )

    // Generate insights
    const insights: Insight[] = []
    const recommendations: Recommendation[] = []

    if (transactions.length === 0) {
      return {
        userId: input.userId,
        period: input.period,
        insights,
        recommendations,
        generatedAt: new Date()
      }
    }

    // Calculate spending vs previous period
    const spendingInsight = await this.generateSpendingTrendInsight(input.userId, startDate)
    if (spendingInsight) {
      insights.push(spendingInsight.insight)
      if (spendingInsight.recommendation) {
        recommendations.push(spendingInsight.recommendation)
      }
    }

    // Calculate top category
    const topCategoryInsight = this.generateTopCategoryInsight(transactions)
    if (topCategoryInsight) {
      insights.push(topCategoryInsight)
    }

    // Calculate savings rate if there's income
    const savingsInsight = this.generateSavingsInsight(transactions)
    if (savingsInsight) {
      insights.push(savingsInsight.insight)
      if (savingsInsight.recommendation) {
        recommendations.push(savingsInsight.recommendation)
      }
    }

    return {
      userId: input.userId,
      period: input.period,
      insights,
      recommendations,
      generatedAt: new Date()
    }
  }

  private validate(input: GetFinancialInsightsInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!['current_month', 'last_3_months', 'last_6_months'].includes(input.period)) {
      throw new Error('Invalid period')
    }
  }

  private getDateRange(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date()
    const startDate = new Date()

    if (period === 'current_month') {
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'last_3_months') {
      startDate.setMonth(startDate.getMonth() - 3)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'last_6_months') {
      startDate.setMonth(startDate.getMonth() - 6)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
    }

    return { startDate, endDate }
  }

  private async generateSpendingTrendInsight(
    userId: string,
    currentPeriodStart: Date
  ): Promise<{ insight: Insight; recommendation?: Recommendation } | null> {
    // Get previous month data for comparison
    const previousMonthEnd = new Date(currentPeriodStart)
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1)
    const previousMonthStart = new Date(previousMonthEnd)
    previousMonthStart.setDate(1)

    const currentTransactions = await this.transactionRepository.getByPeriod(
      userId,
      currentPeriodStart,
      new Date()
    )

    const previousTransactions = await this.transactionRepository.getByPeriod(
      userId,
      previousMonthStart,
      previousMonthEnd
    )

    const currentSpending = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const previousSpending = previousTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    if (previousSpending === 0) {
      return null
    }

    const percentageChange = ((currentSpending - previousSpending) / previousSpending) * 100
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let severity: 'info' | 'warning' | 'critical' = 'info'

    if (percentageChange > 5) {
      trend = 'up'
      severity = percentageChange > 20 ? 'warning' : 'info'
    } else if (percentageChange < -5) {
      trend = 'down'
      severity = 'info'
    }

    const insight: Insight = {
      type: 'spending_trend',
      title: 'Spending Trend',
      description: `Your spending this month is ${Math.abs(percentageChange).toFixed(1)}% ${trend === 'up' ? 'higher' : trend === 'down' ? 'lower' : 'similar to'} last month`,
      value: currentSpending,
      trend,
      severity
    }

    let recommendation: Recommendation | undefined

    if (trend === 'up' && percentageChange > 20) {
      recommendation = {
        type: 'reduce_spending',
        title: 'Consider Reducing Spending',
        description: `Your spending has increased significantly (${percentageChange.toFixed(1)}%). Review your recent expenses and identify areas to cut back.`,
        potentialSavings: currentSpending - previousSpending
      }
    }

    return { insight, recommendation }
  }

  private generateTopCategoryInsight(transactions: any[]): Insight | null {
    const expenses = transactions.filter(t => t.type === 'expense')

    if (expenses.length === 0) {
      return null
    }

    // Group by category
    const categoryTotals = expenses.reduce((acc, t) => {
      const category = t.category || 'Other'
      acc[category] = (acc[category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    // Find top category
    let topCategory = ''
    let topAmount = 0

    for (const [category, amount] of Object.entries(categoryTotals)) {
      if (amount > topAmount) {
        topAmount = amount
        topCategory = category
      }
    }

    const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0)
    const percentage = (topAmount / totalSpending) * 100

    return {
      type: 'top_category',
      title: 'Top Spending Category',
      description: `${topCategory} is your largest expense (${percentage.toFixed(1)}% of total spending)`,
      value: topAmount,
      severity: percentage > 50 ? 'warning' : 'info'
    }
  }

  private generateSavingsInsight(
    transactions: any[]
  ): { insight: Insight; recommendation?: Recommendation } | null {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    if (totalIncome === 0) {
      return null
    }

    const savings = totalIncome - totalExpense
    const savingsRate = (savings / totalIncome) * 100

    let severity: 'info' | 'warning' | 'critical' = 'info'
    if (savingsRate < 0) {
      severity = 'critical'
    } else if (savingsRate < 10) {
      severity = 'warning'
    }

    const insight: Insight = {
      type: 'savings_rate',
      title: 'Savings Rate',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income`,
      value: savings,
      severity
    }

    let recommendation: Recommendation | undefined

    if (savingsRate < 10 && savingsRate >= 0) {
      recommendation = {
        type: 'save_more',
        title: 'Improve Your Savings',
        description: 'Try to save at least 20% of your income. Look for areas to reduce expenses.',
        action: 'Review your budget and identify non-essential expenses'
      }
    }

    return { insight, recommendation }
  }
}
