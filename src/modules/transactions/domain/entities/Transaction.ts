/**
 * Transaction Entity
 * Core domain model for financial transactions
 */
export interface Transaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  amount: number
  category: string // Legacy: free-text category (kept for backward compatibility)
  categoryId?: string // New: reference to categories table
  note?: string
  createdAt: Date
}

export type TransactionType = 'income' | 'expense'

export interface CreateTransactionInput {
  userId: string
  type: TransactionType
  amount: number
  category: string // Legacy field (optional now)
  categoryId?: string // New: reference to category
  note?: string
}

export interface UpdateTransactionInput {
  id: string
  userId: string // For authorization check
  type?: TransactionType
  amount?: number
  category?: string
  categoryId?: string
  note?: string
}

export interface SearchTransactionsInput {
  userId: string
  query?: string // Text search in category and note
  type?: TransactionType // Filter by income or expense
  categoryId?: string // Filter by specific category
  dateFrom?: Date // Filter by date range start
  dateTo?: Date // Filter by date range end
  amountMin?: number // Filter by minimum amount
  amountMax?: number // Filter by maximum amount
}

export type ExportFormat = 'csv' | 'excel'

export interface ExportTransactionsInput {
  transactions: Transaction[]
  format: ExportFormat
  filename?: string
}
