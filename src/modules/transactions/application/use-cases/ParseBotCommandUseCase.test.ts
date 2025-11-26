/**
 * Unit Tests for ParseBotCommandUseCase
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ParseBotCommandUseCase } from './ParseBotCommandUseCase'

describe('ParseBotCommandUseCase', () => {
  let useCase: ParseBotCommandUseCase

  beforeEach(() => {
    useCase = new ParseBotCommandUseCase()
  })

  describe('expense parsing', () => {
    it('should parse expense with format "- category amount"', () => {
      const result = useCase.execute('- makan 25000')

      expect(result).toEqual({
        type: 'expense',
        category: 'makan',
        amount: 25000
      })
    })

    it('should parse expense with k suffix (thousands)', () => {
      const result = useCase.execute('- transport 15k')

      expect(result).toEqual({
        type: 'expense',
        category: 'transport',
        amount: 15000
      })
    })

    it('should parse expense with decimal k suffix', () => {
      const result = useCase.execute('- kopi 7.5k')

      expect(result).toEqual({
        type: 'expense',
        category: 'kopi',
        amount: 7500
      })
    })

    it('should parse expense with jt suffix (millions)', () => {
      const result = useCase.execute('- gadget 2jt')

      expect(result).toEqual({
        type: 'expense',
        category: 'gadget',
        amount: 2000000
      })
    })

    it('should parse expense with decimal jt suffix', () => {
      const result = useCase.execute('- furniture 1.5jt')

      expect(result).toEqual({
        type: 'expense',
        category: 'furniture',
        amount: 1500000
      })
    })

    it('should parse expense with multiple words category', () => {
      const result = useCase.execute('- beli buku 50k')

      expect(result.type).toBe('expense')
      expect(result.amount).toBe(50000)
      expect(result.category).toContain('beli')
    })
  })

  describe('income parsing', () => {
    it('should parse income with format "+ category amount"', () => {
      const result = useCase.execute('+ gaji 5000000')

      expect(result).toEqual({
        type: 'income',
        category: 'gaji',
        amount: 5000000
      })
    })

    it('should parse income with jt suffix', () => {
      const result = useCase.execute('+ bonus 3jt')

      expect(result).toEqual({
        type: 'income',
        category: 'bonus',
        amount: 3000000
      })
    })

    it('should parse income with k suffix', () => {
      const result = useCase.execute('+ freelance 500k')

      expect(result).toEqual({
        type: 'income',
        category: 'freelance',
        amount: 500000
      })
    })
  })

  describe('edge cases', () => {
    it('should handle extra spaces', () => {
      const result = useCase.execute('-  makan   25k  ')

      expect(result).toEqual({
        type: 'expense',
        category: 'makan',
        amount: 25000
      })
    })

    it('should throw error for invalid format', () => {
      expect(() => useCase.execute('invalid command')).toThrow()
    })

    it('should throw error for missing category', () => {
      expect(() => useCase.execute('- 25k')).toThrow()
    })

    it('should throw error for missing amount', () => {
      expect(() => useCase.execute('- makan')).toThrow()
    })

    it('should throw error for invalid amount', () => {
      expect(() => useCase.execute('- makan abc')).toThrow()
    })
  })

  describe('amount formats', () => {
    it('should parse plain number', () => {
      const result = useCase.execute('- makan 25000')
      expect(result.amount).toBe(25000)
    })

    it('should parse k suffix correctly', () => {
      const result = useCase.execute('- makan 25k')
      expect(result.amount).toBe(25000)
    })

    it('should parse jt suffix correctly', () => {
      const result = useCase.execute('- gadget 2jt')
      expect(result.amount).toBe(2000000)
    })

    it('should parse decimal with k suffix', () => {
      const result = useCase.execute('- kopi 7.5k')
      expect(result.amount).toBe(7500)
    })

    it('should parse decimal with jt suffix', () => {
      const result = useCase.execute('- laptop 3.5jt')
      expect(result.amount).toBe(3500000)
    })
  })
})
