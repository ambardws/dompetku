import { ref } from 'vue'

export interface ToastOptions {
  message: string
  title?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Toast extends ToastOptions {
  id: number
  show: boolean
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const show = (options: ToastOptions) => {
    const id = toastId++
    const toast: Toast = {
      id,
      show: true,
      variant: options.variant || 'info',
      duration: options.duration || 3000,
      ...options
    }

    toasts.value.push(toast)

    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration)
    }

    return id
  }

  const success = (message: string, title?: string) => {
    return show({ message, title, variant: 'success' })
  }

  const error = (message: string, title?: string) => {
    return show({ message, title, variant: 'error' })
  }

  const warning = (message: string, title?: string) => {
    return show({ message, title, variant: 'warning' })
  }

  const info = (message: string, title?: string) => {
    return show({ message, title, variant: 'info' })
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove
  }
}
