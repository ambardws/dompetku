import { ref } from 'vue'
import { createWorker } from 'tesseract.js'
import type { ScannedReceipt, ReceiptScanState } from '~modules/receipt-scanner/domain/entities/ScannedReceipt'

/**
 * Composable for scanning receipts using Tesseract OCR only (no AI)
 *
 * Flow:
 * 1. Upload image → Tesseract OCR (client-side)
 * 2. Parse text with regex patterns (client-side)
 * 3. Return structured receipt data
 */
export function useReceiptScanner() {
  const state = ref<ReceiptScanState>({
    ocrText: null,
    scannedData: null,
    isProcessing: false,
    error: null
  })

  /**
   * Parse OCR text to extract receipt data using regex patterns
   */
  const parseReceiptText = (text: string): Partial<ScannedReceipt> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    let merchant = 'Unknown Store'
    let total = 0
    let date = new Date().toISOString().split('T')[0]
    let category = 'other'

    // Find merchant (usually first few lines, look for store name pattern)
    for (const line of lines) {
      const lineLower = line.toLowerCase()
      const lineTrimmed = line.trim()

      // Skip if too short
      if (lineTrimmed.length < 3) continue

      // Skip if starts with number (could be receipt number, date, phone, etc)
      if (lineTrimmed.match(/^\d/)) continue

      // Skip if contains these keywords (not store names)
      const skipKeywords = [
        'total', 'jumlah', 'grand', 'amount', 'tagihan', 'bayar', 'tunai',
        'debit', 'kredit', 'visa', 'master', 'cash', 'change', 'kembalian',
        'receipt', 'struk', 'nota', 'invoice', 'no.', 'nr', 'nomor',
        'tanggal', 'date', 'time', 'waktu', 'jam', 'tgl',
        'kasir', 'cashier', 'operator', 'cs', 'customer',
        'alamat', 'address', 'jalan', 'jl.', 'jln',
        'terima kasih', 'thank you', 'atas belanja', 'shopping',
        'item', 'qty', 'harga', 'price', 'diskon', 'discount'
      ]

      if (skipKeywords.some(keyword => lineLower.includes(keyword))) continue

      // Skip if looks like company suffix (PT, TBK, etc) - these might be part of address
      if (lineTrimmed.match(/^(pt|tbk|cv|ud|pd|fk|fm)\.|^(pt|tbk|cv|ud)\s/i)) continue

      // Skip if looks like a date
      if (lineTrimmed.match(/^\d{2}[\/\.-]\d{2}[\/\.-]\d{4}/)) continue
      if (lineTrimmed.match(/^\d{4}[\/\.-]\d{2}[\/\.-]\d{2}/)) continue

      // Skip if looks like phone number
      if (lineTrimmed.match(/^(\+62|62|0)[0-9]{8,}/)) continue
      if (lineTrimmed.match(/[0-9]{4,}[-\s]*[0-9]{4,}/)) continue

      // Skip if all uppercase and very short (likely header like "PT", "TBK")
      if (lineTrimmed === lineTrimmed.toUpperCase() && lineTrimmed.length < 5) continue

      // Skip if mostly numbers (like receipt numbers)
      const digitCount = (lineTrimmed.match(/\d/g) || []).length
      if (digitCount > lineTrimmed.length / 2) continue

      // Valid store name candidate
      merchant = lineTrimmed
      break
    }

    // Find total amount - look for lines with "total/jumlah" keywords
    // Total is usually near the bottom of the receipt
    const totalKeywords = ['total', 'jumlah', 'grand', 'amount', 'tagihan', 'bayar', 'saldo', 'cash']
    const totalLines: Array<{ line: string, amount: number }> = []

    for (const line of lines) {
      const lineLower = line.toLowerCase()

      // Check if line contains total keyword
      const hasKeyword = totalKeywords.some(keyword => lineLower.includes(keyword))

      if (hasKeyword) {
        // Try to extract amount from this line
        // Pattern 1: "TOTAL Rp 150.000" or "Rp 150.000"
        const rpMatch = line.match(/rp\.?\s*([\d\.,]+)/i)
        if (rpMatch) {
          const rawAmount = rpMatch[1]
          const cleanAmount = rawAmount.replace(/[\.,]/g, '')
          const parsed = parseInt(cleanAmount)
          if (parsed > 100 && parsed < 100000000) {
            totalLines.push({ line, amount: parsed })
          }
        }

        // Pattern 2: "150.000" anywhere in the line with keyword
        const amountMatch = line.match(/([\d\.,]{4,})/)
        if (amountMatch) {
          const rawAmount = amountMatch[1]
          // Must look like a proper amount (has dots as separators or all digits)
          if (rawAmount.includes('.') || /^\d{5,}$/.test(rawAmount)) {
            const cleanAmount = rawAmount.replace(/[\.,]/g, '')
            const parsed = parseInt(cleanAmount)
            if (parsed > 100 && parsed < 100000000) {
              totalLines.push({ line, amount: parsed })
            }
          }
        }
      }
    }

    // If we found total candidates, use the largest one (usually the actual total)
    if (totalLines.length > 0) {
      total = Math.max(...totalLines.map(t => t.amount))
    } else {
      // Fallback: look for large amounts that look like totals
      for (const line of lines) {
        // Pattern: "Rp 150.000" or similar
        const rpMatch = line.match(/rp\.?\s*([\d\.,]+)/i)
        if (rpMatch) {
          const rawAmount = rpMatch[1]
          const cleanAmount = rawAmount.replace(/[\.,]/g, '')
          const parsed = parseInt(cleanAmount)
          if (parsed > 10000 && parsed < 100000000) {
            total = Math.max(total, parsed)
          }
        }
      }
    }

    // Find date - look for date keywords or common date patterns
    const dateKeywords = ['tanggal', 'date', 'tgl', 'tgl', 'time', 'waktu']
    let foundDate = false

    for (const line of lines) {
      const lineLower = line.toLowerCase()

      // Check if line might be a date line
      const hasDateKeyword = dateKeywords.some(keyword => lineLower.includes(keyword))

      // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (Indonesian format)
      const dateMatch1 = line.match(/(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/)
      if (dateMatch1) {
        const day = dateMatch1[1]
        const month = dateMatch1[2]
        const year = dateMatch1[3]
        // Validate date
        if (parseInt(day) <= 31 && parseInt(month) <= 12 && parseInt(year) >= 2000 && parseInt(year) <= 2100) {
          date = `${year}-${month}-${day}`
          foundDate = true
          break
        }
      }

      // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
      const dateMatch2 = line.match(/(\d{4})[\/\.-](\d{2})[\/\.-](\d{2})/)
      if (dateMatch2) {
        const year = dateMatch2[1]
        const month = dateMatch2[2]
        const day = dateMatch2[3]
        // Validate date
        if (parseInt(day) <= 31 && parseInt(month) <= 12 && parseInt(year) >= 2000 && parseInt(year) <= 2100) {
          date = `${year}-${month}-${day}`
          foundDate = true
          break
        }
      }

      // Pattern 3: "15 Jan 2024" or similar
      const dateMatch3 = line.match(/(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{4})/i)
      if (dateMatch3) {
        const day = dateMatch3[1].padStart(2, '0')
        const monthMap: Record<string, string> = {
          jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', jun: '06',
          jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12'
        }
        const month = monthMap[dateMatch3[2].toLowerCase()]
        const year = dateMatch3[3]
        if (month) {
          date = `${year}-${month}-${day}`
          foundDate = true
          break
        }
      }
    }

    // Simple categorization based on merchant name
    const merchantLower = merchant.toLowerCase()
    if (merchantLower.match(/supermarket|superindo|indomaret|alfamart|alfamidi|giant|carrefour|lotte|hypermart|fresh|mart|warung/s)) {
      category = 'groceries'
    } else if (merchantLower.match(/mcd|kfc|burger|starbucks|coffee|cafe|resto|warung|food|rm\.|warung/s)) {
      category = 'food'
    } else if (merchantLower.match(/grab|gojek|taxi|uber|bluebird|transport|bensin|shell|pertamina|spbu|parkir/s)) {
      category = 'transport'
    } else if (merchantLower.match(/pharmacy|kimia farma|k24|apotek|health|clinic|hospital|rs\.|klinik/s)) {
      category = 'health'
    } else if (merchantLower.match(/pln|pdam|token|listrik|air|internet|wifi|telkomsel|indihome|pulsa|data|tagihan/s)) {
      category = 'bills'
    } else if (merchantLower.match(/shopee|tokopedia|lazada|bukalapak|blibli|jd|online|shop/s)) {
      category = 'shopping'
    }

    return {
      merchant,
      total,
      date,
      category,
      items: [] // Not extracting items without AI
    }
  }

  /**
   * Process receipt image with Tesseract OCR only
   * @param file - Image file to process
   * @returns Parsed receipt data
   */
  const scanReceipt = async (file: File): Promise<ScannedReceipt | null> => {
    state.value = {
      ocrText: null,
      scannedData: null,
      isProcessing: true,
      error: null
    }

    try {
      // Extract text with Tesseract (client-side)
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          // Tesseract progress logging
        }
      })

      const { data: { text: ocrText } } = await worker.recognize(file)
      await worker.terminate()

      if (!ocrText || ocrText.trim().length === 0) {
        throw new Error('No text could be extracted from image')
      }

      state.value.ocrText = ocrText

      // Parse receipt data using regex patterns
      const parsedData = parseReceiptText(ocrText)

      // Validate and return
      if (parsedData.total && parsedData.total > 0) {
        state.value.scannedData = parsedData as ScannedReceipt
        return parsedData as ScannedReceipt
      } else {
        // Even if total is not found, return the OCR text for manual entry
        state.value.scannedData = {
          merchant: parsedData.merchant || 'Unknown Store',
          total: 0,
          date: parsedData.date || new Date().toISOString().split('T')[0],
          category: 'other',
          items: []
        }
        return state.value.scannedData
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.isProcessing = false
    }
  }

  /**
   * Reset scanner state
   */
  const reset = () => {
    state.value = {
      ocrText: null,
      scannedData: null,
      isProcessing: false,
      error: null
    }
  }

  return {
    state,
    scanReceipt,
    reset
  }
}
