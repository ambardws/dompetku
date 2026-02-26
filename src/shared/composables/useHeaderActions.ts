import { ref, computed } from 'vue'
import { useToast } from './useToast'
import { useBotLink } from './useBotLink'
import { ExportTransactionsUseCase } from '~modules/transactions/application/use-cases/ExportTransactionsUseCase'
import { downloadFile } from '~shared/utils/downloadFile'
import type { Transaction, ExportFormat } from '~modules/transactions/domain/entities/Transaction'

// Global state for transactions (shared across components)
const globalTransactions = ref<Transaction[]>([])

export function useHeaderActions() {
  const toast = useToast()
  const {
    isGeneratingToken,
    linkToken,
    error: botLinkError,
    generateLinkToken,
    copyTokenToClipboard,
    getTimeRemaining
  } = useBotLink()

  const showBotLinkDialog = ref(false)
  const botTokenTimeRemaining = computed(() => getTimeRemaining())

  // Export handler - uses global transactions
  const handleExport = async (format: ExportFormat) => {
    console.log('useHeaderActions handleExport called, format:', format)
    console.log('globalTransactions:', globalTransactions.value)

    if (!globalTransactions.value || globalTransactions.value.length === 0) {
      toast.error('No transactions to export')
      return
    }

    try {
      const useCase = new ExportTransactionsUseCase()
      const result = await useCase.execute({
        transactions: globalTransactions.value,
        format
      })

      downloadFile(result.content, result.filename, result.mimeType)
      toast.success('Transactions exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export transactions')
    }
  }

  // Set transactions for export
  const setTransactions = (transactions: Transaction[]) => {
    console.log('setTransactions called with:', transactions.length)
    globalTransactions.value = transactions
  }

  // Bot linking handlers
  const openBotLinkDialog = async () => {
    showBotLinkDialog.value = true
    await handleGenerateLinkToken()
  }

  const handleGenerateLinkToken = async () => {
    const result = await generateLinkToken()
    if (result.success) {
      toast.success('Link token created successfully')
    } else {
      toast.error(result.error || 'Failed to create link token')
    }
  }

  const handleCopyToken = async () => {
    const success = await copyTokenToClipboard()
    if (success) {
      toast.success('Token copied successfully')
    } else {
      toast.error('Failed to copy token')
    }
  }

  return {
    // Bot link state
    showBotLinkDialog,
    isGeneratingToken,
    linkToken,
    botLinkError,
    botTokenTimeRemaining,

    // Handlers
    handleExport,
    setTransactions,
    openBotLinkDialog,
    handleGenerateLinkToken,
    handleCopyToken
  }
}
