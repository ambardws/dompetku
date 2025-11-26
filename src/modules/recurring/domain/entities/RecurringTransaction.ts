/**
 * Recurring Transaction Entity
 * Core domain model for recurring/scheduled transactions
 */
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly'

export interface RecurringTransaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  categoryId?: string
  note?: string
  frequency: RecurringFrequency
  startDate: Date
  nextDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateRecurringTransactionInput {
  userId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  categoryId?: string
  note?: string
  frequency: RecurringFrequency
  startDate: Date
}

export interface ProcessRecurringInput {
  userId: string
  currentDate: Date
}
