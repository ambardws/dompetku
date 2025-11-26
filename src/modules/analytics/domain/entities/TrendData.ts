/**
 * Trend Data Entity
 * Represents time-series financial data
 */
export interface TrendDataPoint {
  date: string // YYYY-MM-DD or YYYY-MM
  income: number
  expense: number
  balance: number
}

export interface TrendData {
  period: 'daily' | 'weekly' | 'monthly'
  dataPoints: TrendDataPoint[]
}

export interface GetTrendDataInput {
  userId: string
  startDate: Date
  endDate: Date
  period: 'daily' | 'weekly' | 'monthly'
}
