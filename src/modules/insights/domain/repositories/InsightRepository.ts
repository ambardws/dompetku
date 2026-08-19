export interface InsightRepository {
  getTransactionsByPeriod(userId: string, from: Date, to: Date): Promise<any[]>
}
