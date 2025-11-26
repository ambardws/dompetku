/**
 * Budget Entity
 * Core domain model for budget management
 */
export interface Budget {
  id: string
  userId: string
  categoryId: string
  amount: number // Monthly budget limit
  period: 'monthly' // Currently only monthly, can extend to weekly/yearly
  createdAt: Date
  updatedAt: Date
}

export interface CreateBudgetInput {
  userId: string
  categoryId: string
  amount: number
  period?: 'monthly'
}

export interface UpdateBudgetInput {
  id: string
  userId: string // For authorization
  amount?: number
  period?: 'monthly'
}

export interface BudgetStatus {
  budget: Budget
  spent: number
  remaining: number
  percentage: number
  status: 'safe' | 'warning' | 'exceeded' // safe: <80%, warning: 80-100%, exceeded: >100%
}

export interface GetBudgetStatusInput {
  userId: string
  categoryId: string
  startDate: Date
  endDate: Date
}
