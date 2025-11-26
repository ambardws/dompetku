/**
 * ExportTransactionsUseCase
 * Business logic for exporting transactions to CSV or Excel
 */
import * as XLSX from 'xlsx'
import type { ExportTransactionsInput, Transaction } from '../../domain/entities/Transaction'

export interface ExportResult {
  content: string | ArrayBuffer
  filename: string
  mimeType: string
}

export class ExportTransactionsUseCase {
  execute(input: ExportTransactionsInput): ExportResult {
    // Validation
    this.validate(input)

    // Generate filename
    const filename = input.filename || this.generateFilename(input.format)

    // Export based on format
    if (input.format === 'csv') {
      return this.exportToCSV(input.transactions, filename)
    } else {
      return this.exportToExcel(input.transactions, filename)
    }
  }

  private validate(input: ExportTransactionsInput): void {
    if (!Array.isArray(input.transactions)) {
      throw new Error('Transactions must be an array')
    }

    if (input.format !== 'csv' && input.format !== 'excel') {
      throw new Error('Invalid export format')
    }
  }

  private exportToCSV(transactions: Transaction[], filename: string): ExportResult {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note']
    const rows = transactions.map(t => [
      this.formatDate(t.createdAt),
      t.type,
      t.category,
      t.amount.toString(),
      t.note || ''
    ])

    // Convert to CSV format with proper escaping
    const csvRows = [headers, ...rows].map(row =>
      row.map(cell => this.escapeCSVCell(cell)).join(',')
    )

    const content = csvRows.join('\n')

    return {
      content,
      filename: filename.endsWith('.csv') ? filename : `${filename}.csv`,
      mimeType: 'text/csv'
    }
  }

  private exportToExcel(transactions: Transaction[], filename: string): ExportResult {
    // Create worksheet data
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note']
    const rows = transactions.map(t => [
      this.formatDate(t.createdAt),
      t.type,
      t.category,
      t.amount,
      t.note || ''
    ])

    const wsData = [headers, ...rows]

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

    // Generate Excel file as ArrayBuffer
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })

    return {
      content: excelBuffer,
      filename: filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }

  private generateFilename(format: 'csv' | 'excel'): string {
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const ext = format === 'csv' ? 'csv' : 'xlsx'
    return `transactions_${date}.${ext}`
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  private escapeCSVCell(cell: string): string {
    // If cell contains comma, newline, or quote, wrap in quotes and escape quotes
    if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
      return `"${cell.replace(/"/g, '""')}"`
    }
    return cell
  }
}
