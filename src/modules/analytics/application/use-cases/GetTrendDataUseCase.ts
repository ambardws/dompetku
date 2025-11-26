/**
 * GetTrendDataUseCase
 * Business logic for generating trend/time-series data
 */
import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'
import type { GetTrendDataInput, TrendData, TrendDataPoint } from '../../domain/entities/TrendData'

export class GetTrendDataUseCase {
  constructor(private repository: TransactionRepository) {}

  async execute(input: GetTrendDataInput): Promise<TrendData> {
    // Validation
    this.validate(input)

    // Get all transactions in period
    const transactions = await this.repository.getByPeriod(
      input.userId,
      input.startDate,
      input.endDate
    )

    // Generate data points based on period
    const dataPoints = this.generateDataPoints(transactions, input)

    return {
      period: input.period,
      dataPoints
    }
  }

  private generateDataPoints(transactions: any[], input: GetTrendDataInput): TrendDataPoint[] {
    const points: Map<string, TrendDataPoint> = new Map()

    // Initialize all periods with zeros
    const current = new Date(input.startDate)
    while (current <= input.endDate) {
      const key = this.formatPeriodKey(current, input.period)
      points.set(key, {
        date: key,
        income: 0,
        expense: 0,
        balance: 0
      })

      // Move to next period
      if (input.period === 'monthly') {
        current.setMonth(current.getMonth() + 1)
      } else if (input.period === 'weekly') {
        current.setDate(current.getDate() + 7)
      } else {
        current.setDate(current.getDate() + 1)
      }
    }

    // Aggregate transactions
    for (const transaction of transactions) {
      const key = this.formatPeriodKey(transaction.createdAt, input.period)
      const point = points.get(key)

      if (point) {
        if (transaction.type === 'income') {
          point.income += transaction.amount
        } else {
          point.expense += transaction.amount
        }
        point.balance = point.income - point.expense
      }
    }

    return Array.from(points.values())
  }

  private formatPeriodKey(date: Date, period: 'daily' | 'weekly' | 'monthly'): string {
    if (period === 'monthly') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    // For daily/weekly, use full date
    return date.toISOString().split('T')[0]
  }

  private validate(input: GetTrendDataInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!['daily', 'weekly', 'monthly'].includes(input.period)) {
      throw new Error('Invalid period')
    }
  }
}
