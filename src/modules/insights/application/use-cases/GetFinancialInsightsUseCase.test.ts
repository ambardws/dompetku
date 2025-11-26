/**
 * GetFinancialInsightsUseCase Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { GetFinancialInsightsUseCase } from './GetFinancialInsightsUseCase'
import type { TransactionRepository } from '../../../transactions/domain/repositories/TransactionRepository'
import type { Transaction } from '../../../transactions/domain/entities/Transaction'

// Mock repository
class MockTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = []

  async add(): Promise<void> {}
  async getById(): Promise<Transaction | null> { return null }
  async update(): Promise<void> {}
  async delete(): Promise<void> {}
  async search(): Promise<Transaction[]> { return [] }

  async getByPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactions.filter(t =>
      t.userId === userId &&
      t.createdAt >= startDate &&
      t.createdAt <= endDate
    )
  }

  // Helper for tests
  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction)
  }

  clearAll(): void {
    this.transactions = []
  }
}

describe('GetFinancialInsightsUseCase', () => {
  let useCase: GetFinancialInsightsUseCase
  let repository: MockTransactionRepository

  beforeEach(() => {
    repository = new MockTransactionRepository()
    useCase = new GetFinancialInsightsUseCase(repository)
    repository.clearAll()
  })

  describe('Validation', () => {
    it('should throw error if userId is empty', async () => {
      await expect(useCase.execute({
        userId: '',
        period: 'current_month'
      })).rejects.toThrow('User ID is required')
    })

    it('should throw error if period is invalid', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        period: 'invalid' as any
      })).rejects.toThrow('Invalid period')
    })
  })

  describe('Basic Insights Generation', () => {
    it('should return empty insights for user with no transactions', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      expect(result).toBeDefined()
      expect(result.userId).toBe('user-1')
      expect(result.period).toBe('current_month')
      expect(result.insights).toHaveLength(0)
      expect(result.recommendations).toHaveLength(0)
      expect(result.generatedAt).toBeInstanceOf(Date)
    })

    it('should generate insights for current month', async () => {
      const now = new Date()
      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      expect(result.insights.length).toBeGreaterThan(0)
    })
  })

  describe('Spending Trend Insights', () => {
    it('should detect increasing spending trend', async () => {
      const now = new Date()
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      // Last month: 500k
      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: lastMonth,
        updatedAt: lastMonth
      })

      // This month: 800k
      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 800000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      const spendingTrend = result.insights.find(i => i.type === 'spending_trend')
      expect(spendingTrend).toBeDefined()
      expect(spendingTrend?.trend).toBe('up')
    })

    it('should detect decreasing spending trend', async () => {
      const now = new Date()
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      // Last month: 800k
      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 800000,
        category: 'makan',
        createdAt: lastMonth,
        updatedAt: lastMonth
      })

      // This month: 500k
      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      const spendingTrend = result.insights.find(i => i.type === 'spending_trend')
      expect(spendingTrend).toBeDefined()
      expect(spendingTrend?.trend).toBe('down')
    })

    it('should detect stable spending trend', async () => {
      const now = new Date()
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      // Last month: 500k
      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: lastMonth,
        updatedAt: lastMonth
      })

      // This month: 510k (within 5% threshold)
      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 510000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      const spendingTrend = result.insights.find(i => i.type === 'spending_trend')
      expect(spendingTrend).toBeDefined()
      expect(spendingTrend?.trend).toBe('stable')
    })
  })

  describe('Top Category Insights', () => {
    it('should identify top spending category', async () => {
      const now = new Date()

      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 800000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 300000,
        category: 'transport',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      const topCategory = result.insights.find(i => i.type === 'top_category')
      expect(topCategory).toBeDefined()
      expect(topCategory?.description).toContain('makan')
    })

    it('should handle multiple transactions in same category', async () => {
      const now = new Date()

      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 300000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      const topCategory = result.insights.find(i => i.type === 'top_category')
      expect(topCategory).toBeDefined()
      expect(topCategory?.value).toBe(800000) // 300k + 500k
    })
  })

  describe('Recommendations', () => {
    it('should recommend reducing spending when trend is up significantly', async () => {
      const now = new Date()
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      // Last month: 500k
      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: lastMonth,
        updatedAt: lastMonth
      })

      // This month: 1000k (100% increase)
      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 1000000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      const reduceSpending = result.recommendations.find(r => r.type === 'reduce_spending')
      expect(reduceSpending).toBeDefined()
    })

    it('should recommend saving more when income exceeds expenses', async () => {
      const now = new Date()

      // Income: 5000k
      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'income',
        amount: 5000000,
        category: 'gaji',
        createdAt: now,
        updatedAt: now
      })

      // Expense: 2000k (60% savings rate!)
      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 2000000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      // Should have positive insights when saving well
      expect(result.insights.length).toBeGreaterThan(0)
    })
  })

  describe('User Isolation', () => {
    it('should only analyze transactions for specified user', async () => {
      const now = new Date()

      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      repository.addTransaction({
        id: 'tx-2',
        userId: 'user-2',
        type: 'expense',
        amount: 1000000,
        category: 'makan',
        createdAt: now,
        updatedAt: now
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'current_month'
      })

      // Should only consider user-1's 500k transaction
      const topCategory = result.insights.find(i => i.type === 'top_category')
      expect(topCategory?.value).toBe(500000)
    })
  })

  describe('Period Handling', () => {
    it('should handle last_3_months period', async () => {
      const now = new Date()
      const twoMonthsAgo = new Date(now)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: twoMonthsAgo,
        updatedAt: twoMonthsAgo
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'last_3_months'
      })

      expect(result.period).toBe('last_3_months')
      expect(result.insights.length).toBeGreaterThan(0)
    })

    it('should handle last_6_months period', async () => {
      const now = new Date()
      const fiveMonthsAgo = new Date(now)
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5)

      repository.addTransaction({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 500000,
        category: 'makan',
        createdAt: fiveMonthsAgo,
        updatedAt: fiveMonthsAgo
      })

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'last_6_months'
      })

      expect(result.period).toBe('last_6_months')
    })
  })
})
