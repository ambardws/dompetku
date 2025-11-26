/**
 * CreateBillReminderUseCase
 * Business logic for creating bill reminders
 */
import { nanoid } from 'nanoid'
import type { BillReminderRepository } from '../../domain/repositories/BillReminderRepository'
import type { BillReminder, CreateBillReminderInput } from '../../domain/entities/BillReminder'

export class CreateBillReminderUseCase {
  constructor(private repository: BillReminderRepository) {}

  async execute(input: CreateBillReminderInput): Promise<BillReminder> {
    // Validation
    this.validate(input)

    // Create bill reminder
    const reminder: BillReminder = {
      id: nanoid(),
      userId: input.userId,
      title: input.title,
      amount: input.amount,
      categoryId: input.categoryId,
      frequency: input.frequency,
      nextDueDate: input.nextDueDate,
      reminderDays: input.reminderDays,
      isActive: true,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.repository.add(reminder)
    return reminder
  }

  private validate(input: CreateBillReminderInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!input.title || input.title.trim() === '') {
      throw new Error('Title is required')
    }

    if (input.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (!['monthly', 'yearly', 'weekly', 'custom'].includes(input.frequency)) {
      throw new Error('Invalid frequency')
    }

    if (input.reminderDays < 0) {
      throw new Error('Reminder days cannot be negative')
    }
  }
}
