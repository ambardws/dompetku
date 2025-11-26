/**
 * SetBudgetUseCase
 * Business logic for creating or updating budgets
 */
import type { BudgetRepository } from '../../domain/repositories/BudgetRepository'
import type { CreateBudgetInput, Budget } from '../../domain/entities/Budget'
import { nanoid } from 'nanoid'

export class SetBudgetUseCase {
  constructor(private repository: BudgetRepository) {}

  async execute(input: CreateBudgetInput): Promise<Budget> {
    // Validation
    this.validate(input)

    // Check if budget already exists for this category
    const existingBudget = await this.repository.getByCategoryId(input.userId, input.categoryId)

    if (existingBudget) {
      // Update existing budget
      await this.repository.update(existingBudget.id, {
        amount: input.amount
      })

      return {
        ...existingBudget,
        amount: input.amount,
        updatedAt: new Date()
      }
    }

    // Create new budget
    const budget: Budget = {
      id: nanoid(),
      userId: input.userId,
      categoryId: input.categoryId,
      amount: input.amount,
      period: input.period || 'monthly',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.repository.add(budget)

    return budget
  }

  private validate(input: CreateBudgetInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!input.categoryId || input.categoryId.trim() === '') {
      throw new Error('Category ID is required')
    }

    if (input.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }
  }
}
