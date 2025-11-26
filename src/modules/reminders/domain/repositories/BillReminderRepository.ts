/**
 * BillReminderRepository Interface
 * Contract for bill reminder data operations
 */

import type { BillReminder } from '../entities/BillReminder'

export interface BillReminderRepository {
  /**
   * Add a new bill reminder
   */
  add(reminder: BillReminder): Promise<void>

  /**
   * Get all reminders for a user
   */
  getByUserId(userId: string): Promise<BillReminder[]>

  /**
   * Get a reminder by ID
   */
  getById(id: string): Promise<BillReminder | null>

  /**
   * Get active reminders for a user
   */
  getActiveByUserId(userId: string): Promise<BillReminder[]>

  /**
   * Get reminders due within date range
   */
  getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<BillReminder[]>

  /**
   * Update a reminder
   */
  update(id: string, updates: Partial<BillReminder>): Promise<void>

  /**
   * Delete a reminder
   */
  delete(id: string): Promise<void>
}
