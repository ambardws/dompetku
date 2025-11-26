/**
 * Unit Tests for ExportTransactionsUseCase
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ExportTransactionsUseCase } from './ExportTransactionsUseCase'
import type { ExportTransactionsInput, Transaction } from '../../domain/entities/Transaction'

describe('ExportTransactionsUseCase', () => {
  let useCase: ExportTransactionsUseCase

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'user-123',
      type: 'expense',
      amount: 50000,
      category: 'Makan',
      categoryId: 'cat-food',
      note: 'Lunch at cafe',
      createdAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      userId: 'user-123',
      type: 'income',
      amount: 5000000,
      category: 'Gaji',
      categoryId: 'cat-salary',
      note: 'Monthly salary',
      createdAt: new Date('2024-01-01T09:00:00')
    },
    {
      id: '3',
      userId: 'user-123',
      type: 'expense',
      amount: 25000,
      category: 'Transport',
      categoryId: 'cat-transport',
      createdAt: new Date('2024-01-10T08:15:00')
    }
  ]

  beforeEach(() => {
    useCase = new ExportTransactionsUseCase()
  })

  describe('execute - CSV format', () => {
    const validInput: ExportTransactionsInput = {
      transactions: mockTransactions,
      format: 'csv'
    }

    it('should export transactions to CSV format', () => {
      const result = useCase.execute(validInput)

      expect(result).toBeDefined()
      expect(result.content).toContain('Date,Type,Category,Amount,Note')
      expect(result.content).toContain('Makan')
      expect(result.content).toContain('50000')
      expect(result.mimeType).toBe('text/csv')
    })

    it('should include all transactions in CSV', () => {
      const result = useCase.execute(validInput)

      const lines = result.content.split('\n').filter(line => line.trim())
      // Header + 3 transactions
      expect(lines.length).toBe(4)
    })

    it('should format date correctly in CSV', () => {
      const result = useCase.execute(validInput)

      expect(result.content).toContain('2024-01-15')
      expect(result.content).toContain('2024-01-01')
      expect(result.content).toContain('2024-01-10')
    })

    it('should include type (income/expense) in CSV', () => {
      const result = useCase.execute(validInput)

      expect(result.content).toContain('expense')
      expect(result.content).toContain('income')
    })

    it('should handle transactions without notes', () => {
      const result = useCase.execute(validInput)

      expect(result.content).toContain('Transport')
      // Line for transport transaction should not have note
    })

    it('should escape commas in notes', () => {
      const input: ExportTransactionsInput = {
        transactions: [{
          ...mockTransactions[0],
          note: 'Lunch, dinner, and snacks'
        }],
        format: 'csv'
      }

      const result = useCase.execute(input)

      // Should wrap in quotes when there's comma
      expect(result.content).toContain('"Lunch, dinner, and snacks"')
    })

    it('should handle empty transactions array', () => {
      const input: ExportTransactionsInput = {
        transactions: [],
        format: 'csv'
      }

      const result = useCase.execute(input)

      expect(result.content).toContain('Date,Type,Category,Amount,Note')
      const lines = result.content.split('\n').filter(line => line.trim())
      expect(lines.length).toBe(1) // Only header
    })

    it('should use default filename if not provided', () => {
      const result = useCase.execute(validInput)

      expect(result.filename).toMatch(/^transactions_\d{4}-\d{2}-\d{2}\.csv$/)
    })

    it('should use custom filename if provided', () => {
      const input: ExportTransactionsInput = {
        ...validInput,
        filename: 'my-transactions.csv'
      }

      const result = useCase.execute(input)

      expect(result.filename).toBe('my-transactions.csv')
    })
  })

  describe('validation', () => {
    it('should throw error when transactions is not an array', () => {
      const input = {
        transactions: null as any,
        format: 'csv' as const
      }

      expect(() => useCase.execute(input)).toThrow('Transactions must be an array')
    })

    it('should throw error when format is invalid', () => {
      const input = {
        transactions: mockTransactions,
        format: 'pdf' as any
      }

      expect(() => useCase.execute(input)).toThrow('Invalid export format')
    })
  })

  describe('execute - Excel format', () => {
    it('should export transactions to Excel format', () => {
      const input: ExportTransactionsInput = {
        transactions: mockTransactions,
        format: 'excel'
      }

      const result = useCase.execute(input)

      expect(result).toBeDefined()
      expect(result.mimeType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      expect(result.filename).toContain('.xlsx')
    })

    it('should use default filename for Excel', () => {
      const input: ExportTransactionsInput = {
        transactions: mockTransactions,
        format: 'excel'
      }

      const result = useCase.execute(input)

      expect(result.filename).toMatch(/^transactions_\d{4}-\d{2}-\d{2}\.xlsx$/)
    })
  })
})
