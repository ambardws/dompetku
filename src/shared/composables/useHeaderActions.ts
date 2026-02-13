import { ref, computed } from 'vue'
import { useToast } from './useToast'
import { useBotLink } from './useBotLink'
import { ExportTransactionsUseCase } from '~modules/transactions/application/use-cases/ExportTransactionsUseCase'
import { downloadFile } from '~shared/utils/downloadFile'
import type { Transaction, ExportFormat } from '~modules/transactions/domain/entities/Transaction'

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

  // Export handler - accepts transactions as parameter
  const handleExport = async (transactions: Transaction[], format: ExportFormat) => {
    try {
      const useCase = new ExportTransactionsUseCase()
      const result = await useCase.execute({
        transactions,
        format
      })

      downloadFile(result.content, result.filename, result.mimeType)
      toast.success('Transaksi berhasil diekspor')
    } catch (error) {
      console.error('Failed to export transactions:', error)
      toast.error('Gagal mengekspor transaksi')
    }
  }

  // Bot linking handlers
  const openBotLinkDialog = async () => {
    showBotLinkDialog.value = true
    await handleGenerateLinkToken()
  }

  const handleGenerateLinkToken = async () => {
    const result = await generateLinkToken()
    if (result.success) {
      toast.success('Link token berhasil dibuat')
    } else {
      toast.error(result.error || 'Gagal membuat link token')
    }
  }

  const handleCopyToken = async () => {
    const success = await copyTokenToClipboard()
    if (success) {
      toast.success('Token berhasil disalin')
    } else {
      toast.error('Gagal menyalin token')
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
    openBotLinkDialog,
    handleGenerateLinkToken,
    handleCopyToken
  }
}
