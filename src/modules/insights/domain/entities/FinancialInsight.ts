/**
 * FinancialInsight Entity
 * Represents financial insights and analysis for users
 */

export interface FinancialInsight {
  userId: string
  period: InsightPeriod
  insights: Insight[]
  recommendations: Recommendation[]
  generatedAt: Date
}

export interface Insight {
  type: InsightType
  title: string
  description: string
  value?: number
  trend?: 'up' | 'down' | 'stable'
  severity?: 'info' | 'warning' | 'critical'
}

export interface Recommendation {
  type: RecommendationType
  title: string
  description: string
  action?: string
  potentialSavings?: number
}

export type InsightType =
  | 'spending_trend'
  | 'budget_performance'
  | 'unusual_expense'
  | 'top_category'
  | 'savings_rate'
  | 'month_comparison'

export type RecommendationType =
  | 'reduce_spending'
  | 'increase_budget'
  | 'create_budget'
  | 'save_more'
  | 'review_category'

export type InsightPeriod = 'current_month' | 'last_3_months' | 'last_6_months'

export interface GetFinancialInsightsInput {
  userId: string
  period: InsightPeriod
}

export interface SpendingComparison {
  currentMonth: number
  previousMonth: number
  percentageChange: number
  trend: 'up' | 'down' | 'stable'
}

export interface CategoryInsight {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  trend?: 'up' | 'down' | 'stable'
  vs_previous?: number
}
