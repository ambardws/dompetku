import { provide, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { useConfirm } from './useConfirm'
import type { ExportFormat } from '~modules/transactions/domain/entities/Transaction'

export type { ExportFormat }

export function useSharedHeader() {
  const handleLogout = inject<(() => void)>('handleLogout')
  const handleBack = inject<(() => void)>('handleBack')

  return {
    handleLogout,
    handleBack
  }
}

export function useSharedHeaderProvider() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()

  const handleLogout = async () => {
    const confirmed = await confirm.warning(
      'Logout',
      'Are you sure you want to logout? You will need to login again to access the application.',
      'Yes, Logout',
      'Cancel'
    )

    if (!confirmed) return

    const result = await logout()
    if (result.success) {
      await router.push('/login')
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Provide the handlers to child components
  provide('handleLogout', handleLogout)
  provide('handleBack', handleBack)

  return {
    handleLogout,
    handleBack
  }
}
