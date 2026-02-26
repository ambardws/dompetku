<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
    <div class="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 min-h-screen shadow-lg px-4 py-6 sm:py-8 pb-24">
      <!-- Header -->
      <DPageHeader
        :title="pageMeta.title || 'Dompetku'"
        :subtitle="pageMeta.subtitle"
        :icon="pageMeta.icon || 'wallet'"
        :show-back-button="pageMeta.showBackButton"
        :user-email="user?.email"
        @back="handleBack"
      >
        <template #actions-menu v-if="pageMeta.showActionsMenu !== false">
          <DActionsMenu
            :show-budget-link="pageMeta.showBudgetLink !== false"
            @export="handleExport"
            @manage-categories="router.push('/categories')"
            @manage-budgets="router.push('/budgets')"
            @link-bot="handleBotLink"
            @logout="handleLogout"
          />
        </template>
        <template #notification>
          <DNotificationBell />
        </template>
        <template #dark-mode-toggle>
          <DDarkModeToggle :is-dark="isDark" @toggle="toggleDarkMode" />
        </template>
      </DPageHeader>

      <!-- Page Content -->
      <slot />
    </div>

    <!-- Floating Action Button -->
    <DFloatingActionButton v-if="pageMeta.showFAB !== false" :to="pageMeta.fabTo || '/transactions/add'" />

    <!-- Bot Link Dialog -->
    <DBotLinkDialog
      v-if="pageMeta.showActionsMenu !== false"
      v-model="showBotLinkDialog"
      :token="linkToken"
      :is-generating="isGeneratingToken"
      :error="botLinkError"
      :time-remaining="botTokenTimeRemaining"
      @retry="handleGenerateLinkToken"
      @copy="handleCopyToken"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~shared/composables/useAuth'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useSharedHeader } from '~shared/composables/useSharedHeader'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DActionsMenu from '~shared/ui/molecules/DActionsMenu.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'
import DFloatingActionButton from '~shared/ui/atoms/DFloatingActionButton.vue'
import DBotLinkDialog from '~shared/ui/molecules/DBotLinkDialog.vue'

const router = useRouter()
const { user } = useAuth()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const { handleLogout, handleBack: sharedHandleBack } = useSharedHeader()

// Get page meta from provide (injected by page)
const pageMeta = inject<any>('pageMeta', {
  title: 'Dompetku',
  subtitle: 'Kelola keuangan dengan cerdas',
  icon: 'wallet',
  showBackButton: false,
  showActionsMenu: true,
  showBudgetLink: true,
  showFAB: true,
  fabTo: '/transactions/add'
})

// Get header actions from provide
const headerActions = inject<any>('headerActions', {})
// Use refs directly from headerActions instead of creating new ones
const showBotLinkDialog = headerActions.showBotLinkDialog || ref(false)
const isGeneratingToken = headerActions.isGeneratingToken || ref(false)
const linkToken = headerActions.linkToken || ref('')
const botLinkError = headerActions.botLinkError || ref('')
const botTokenTimeRemaining = headerActions.botTokenTimeRemaining || ref(0)

const handleBack = () => {
  sharedHandleBack()
}

const handleExport = async (format: string) => {
  console.log('Layout handleExport called with format:', format)
  // Directly call the headerActions handleExport
  if (headerActions.handleExport) {
    await headerActions.handleExport(format)
  }
}

const handleBotLink = () => {
  if (headerActions.openBotLinkDialog) {
    headerActions.openBotLinkDialog()
  }
}

const handleGenerateLinkToken = () => {
  if (headerActions.handleGenerateLinkToken) {
    headerActions.handleGenerateLinkToken()
  }
}

const handleCopyToken = () => {
  if (headerActions.handleCopyToken) {
    headerActions.handleCopyToken()
  }
}
</script>
