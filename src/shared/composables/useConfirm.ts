import { ref } from 'vue'

export interface ConfirmOptions {
  title: string
  message: string
  variant?: 'info' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  loadingText?: string
}

interface ConfirmState extends ConfirmOptions {
  show: boolean
  loading: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const state = ref<ConfirmState>({
  show: false,
  loading: false,
  title: '',
  message: '',
  variant: 'info'
})

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        ...options,
        show: true,
        loading: false,
        onConfirm: async () => {
          resolve(true)
          state.value.show = false
        },
        onCancel: () => {
          resolve(false)
          state.value.show = false
        }
      }
    })
  }

  const danger = (title: string, message: string, confirmText = 'Delete', cancelText = 'Cancel') => {
    return confirm({
      title,
      message,
      variant: 'danger',
      confirmText,
      cancelText,
      loadingText: 'Deleting...'
    })
  }

  const warning = (title: string, message: string, confirmText = 'Yes', cancelText = 'No') => {
    return confirm({
      title,
      message,
      variant: 'warning',
      confirmText,
      cancelText,
      loadingText: 'Processing...'
    })
  }

  const info = (title: string, message: string, confirmText = 'OK', cancelText = 'Cancel') => {
    return confirm({
      title,
      message,
      variant: 'info',
      confirmText,
      cancelText
    })
  }

  const handleConfirm = async () => {
    if (state.value.onConfirm) {
      await state.value.onConfirm()
    }
  }

  const handleCancel = () => {
    if (state.value.onCancel) {
      state.value.onCancel()
    }
  }

  const setLoading = (loading: boolean) => {
    state.value.loading = loading
  }

  return {
    state,
    confirm,
    danger,
    warning,
    info,
    handleConfirm,
    handleCancel,
    setLoading
  }
}
