/**
 * BillReminder Entity
 * Represents a recurring bill reminder
 */

export interface BillReminder {
  id: string
  userId: string
  title: string
  amount: number
  categoryId?: string
  frequency: ReminderFrequency
  nextDueDate: Date
  reminderDays: number // Days before due date to remind
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ReminderFrequency = 'monthly' | 'yearly' | 'weekly' | 'custom'

export interface CreateBillReminderInput {
  userId: string
  title: string
  amount: number
  categoryId?: string
  frequency: ReminderFrequency
  nextDueDate: Date
  reminderDays: number
  notes?: string
}

export interface UpdateBillReminderInput {
  id: string
  userId: string
  title?: string
  amount?: number
  categoryId?: string
  frequency?: ReminderFrequency
  nextDueDate?: Date
  reminderDays?: number
  isActive?: boolean
  notes?: string
}

export interface GetUpcomingRemindersInput {
  userId: string
  days: number // Get reminders due within next N days
}

export interface UpcomingReminder {
  reminder: BillReminder
  daysUntilDue: number
  isOverdue: boolean
}
