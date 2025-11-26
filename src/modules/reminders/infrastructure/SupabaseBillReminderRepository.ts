/**
 * Supabase implementation of BillReminderRepository
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BillReminderRepository } from '../domain/repositories/BillReminderRepository'
import type { BillReminder } from '../domain/entities/BillReminder'

export class SupabaseBillReminderRepository implements BillReminderRepository {
  constructor(private supabase: SupabaseClient) {}

  async add(reminder: BillReminder): Promise<void> {
    const { error } = await this.supabase.from('bill_reminders').insert({
      id: reminder.id,
      user_id: reminder.userId,
      title: reminder.title,
      amount: reminder.amount,
      category_id: reminder.categoryId,
      frequency: reminder.frequency,
      next_due_date: reminder.nextDueDate.toISOString(),
      reminder_days: reminder.reminderDays,
      is_active: reminder.isActive,
      notes: reminder.notes,
      created_at: reminder.createdAt.toISOString(),
      updated_at: reminder.updatedAt.toISOString()
    })

    if (error) {
      throw new Error(`Failed to add bill reminder: ${error.message}`)
    }
  }

  async getByUserId(userId: string): Promise<BillReminder[]> {
    const { data, error } = await this.supabase
      .from('bill_reminders')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to get bill reminders: ${error.message}`)
    }

    return (data || []).map(this.mapToEntity)
  }

  async getById(id: string): Promise<BillReminder | null> {
    const { data, error } = await this.supabase
      .from('bill_reminders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get bill reminder: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async getActiveByUserId(userId: string): Promise<BillReminder[]> {
    const { data, error } = await this.supabase
      .from('bill_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to get active bill reminders: ${error.message}`)
    }

    return (data || []).map(this.mapToEntity)
  }

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<BillReminder[]> {
    const { data, error } = await this.supabase
      .from('bill_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('next_due_date', startDate.toISOString())
      .lte('next_due_date', endDate.toISOString())
      .order('next_due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to get bill reminders by date range: ${error.message}`)
    }

    return (data || []).map(this.mapToEntity)
  }

  async update(id: string, updates: Partial<BillReminder>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.nextDueDate !== undefined) updateData.next_due_date = updates.nextDueDate.toISOString()
    if (updates.reminderDays !== undefined) updateData.reminder_days = updates.reminderDays
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.updatedAt !== undefined) updateData.updated_at = updates.updatedAt.toISOString()

    const { error } = await this.supabase
      .from('bill_reminders')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update bill reminder: ${error.message}`)
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bill_reminders')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete bill reminder: ${error.message}`)
    }
  }

  private mapToEntity(data: any): BillReminder {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      amount: parseFloat(data.amount),
      categoryId: data.category_id,
      frequency: data.frequency,
      nextDueDate: new Date(data.next_due_date),
      reminderDays: data.reminder_days,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}
