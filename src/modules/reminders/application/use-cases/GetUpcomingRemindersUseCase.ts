/**
 * GetUpcomingRemindersUseCase
 * Business logic for getting upcoming bill reminders
 */
import type { BillReminderRepository } from '../../domain/repositories/BillReminderRepository'
import type { GetUpcomingRemindersInput, UpcomingReminder } from '../../domain/entities/BillReminder'

export class GetUpcomingRemindersUseCase {
  constructor(private repository: BillReminderRepository) {}

  async execute(input: GetUpcomingRemindersInput): Promise<UpcomingReminder[]> {
    // Validation
    this.validate(input)

    // Calculate date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + input.days)

    // Get reminders in date range (including past due)
    const pastDate = new Date(today)
    pastDate.setFullYear(pastDate.getFullYear() - 1) // Check up to 1 year in the past for overdue

    const reminders = await this.repository.getByDateRange(
      input.userId,
      pastDate,
      endDate
    )

    // Map to UpcomingReminder with calculated fields
    const upcomingReminders: UpcomingReminder[] = reminders.map(reminder => {
      const dueDate = new Date(reminder.nextDueDate)
      dueDate.setHours(0, 0, 0, 0)

      const diffTime = dueDate.getTime() - today.getTime()
      const daysUntilDue = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      return {
        reminder,
        daysUntilDue,
        isOverdue: daysUntilDue < 0
      }
    })

    // Sort by due date (earliest first, overdue items first)
    upcomingReminders.sort((a, b) => {
      return a.reminder.nextDueDate.getTime() - b.reminder.nextDueDate.getTime()
    })

    return upcomingReminders
  }

  private validate(input: GetUpcomingRemindersInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (input.days <= 0) {
      throw new Error('Days must be greater than or equal to 0')
    }
  }
}
