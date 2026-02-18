/**
 * Represents a receipt item extracted from a scanned receipt
 */
export interface ReceiptItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

/**
 * Represents a scanned receipt with all extracted data
 */
export interface ScannedReceipt {
  merchant: string          // Store name (e.g., "Indomaret", "Alfamart")
  total: number             // Total amount in Rupiah
  date: string             // Date in YYYY-MM-DD format
  time?: string            // Time in HH:MM format (optional)
  items?: ReceiptItem[]    // List of items (optional)
  category: string         // Detected category
}

/**
 * Represents the state of receipt scanning process
 */
export interface ReceiptScanState {
  ocrText: string | null         // Raw text from Tesseract
  scannedData: ScannedReceipt | null  // Parsed data from Gemini
  isProcessing: boolean           // Currently processing
  error: string | null           // Error message if any
}
