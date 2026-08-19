<template>
  <div class="bg-gray-100 dark:bg-gray-950 pb-16 transition-colors">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Recurring Transactions"
        subtitle="Automated regular transactions"
        icon="refresh"
        :show-back-button="true"
        :user-email="user?.email"
        @back="handleBack"
      >
        <template #actions-menu>
          <DActionsMenu
            :show-export="false"
            @manage-categories="router.push('/categories')"
            @manage-budgets="router.push('/budgets')"
            @link-bot="() => {}"
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

      <!-- Add Button -->
      <div class="mb-5">
        <button
          @click="showForm = true"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Recurring
        </button>
      </div>

      <!-- Form Dialog -->
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showForm = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold mb-4 text-slate-800 dark:text-white">
            {{ editingRecurring ? 'Edit' : 'New' }} Recurring Transaction
          </h2>
          <DRecurringForm
            :recurring="editingRecurring"
            :loading="saving"
            @submit="handleSubmit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Recurring List -->
      <DRecurringList
        :recurrings="recurrings"
        :loading="loading"
        @toggle-active="handleToggleActive"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RecurringTransaction } from '~modules/recurring/domain/entities/RecurringTransaction'
import { useAuth } from '~shared/composables/useAuth'
import { useRecurringTransactionRepository } from '~shared/composables/useRecurringTransactionRepository'
import { useToast } from '~shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useSharedHeader } from '~shared/composables/useSharedHeader'
import DRecurringList from '~/modules/recurring/ui/organisms/DRecurringList.vue'
import DRecurringForm from '~/modules/recurring/ui/molecules/DRecurringForm.vue'
import DPageHeader from '~shared/ui/organisms/DPageHeader.vue'
import DActionsMenu from '~shared/ui/molecules/DActionsMenu.vue'
import DNotificationBell from '~shared/ui/molecules/DNotificationBell.vue'
import DDarkModeToggle from '~shared/ui/atoms/DDarkModeToggle.vue'

definePageMeta({
  middleware: [
    async function (to, from) {
      if (process.server) return
      try {
        const { user, init } = useAuth()
        if (!user.value) await init()
        if (!user.value) return navigateTo('/login')
      } catch (error) {
        return navigateTo('/login')
      }
    }
  ]
})

const router = useRouter()
const { user } = useAuth()
const { repository } = useRecurringTransactionRepository()
const toast = useToast()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const { handleLogout } = useSharedHeader()

const recurrings = ref<RecurringTransaction[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingRecurring = ref<RecurringTransaction | undefined>()

const handleBack = () => router.push('/')

const loadRecurrings = async () => {
  if (!user.value?.id) return
  loading.value = true
  try { recurrings.value = await repository.getByUserId(user.value.id) }
  catch (e) { toast.error('Failed to load recurring transactions') }
  finally { loading.value = false }
}

const handleSubmit = async (data: Partial<RecurringTransaction>) => {
  if (!user.value?.id) return
  saving.value = true
  try {
    if (editingRecurring.value) {
      await repository.update(editingRecurring.value.id, data)
      toast.success('Recurring transaction updated')
    } else {
      await repository.add({
        id: '',
        userId: user.value.id,
        type: data.type!,
        amount: data.amount!,
        category: data.category!,
        categoryId: data.categoryId,
        note: data.note,
        frequency: data.frequency!,
        startDate: data.startDate!,
        nextDate: data.startDate!,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as RecurringTransaction)
      toast.success('Recurring transaction created')
    }
    showForm.value = false
    editingRecurring.value = undefined
    await loadRecurrings()
  } catch (e) { toast.error('Failed to save recurring transaction') }
  finally { saving.value = false }
}

const handleDelete = async () => {
  if (!editingRecurring.value) return
  try {
    await repository.delete(editingRecurring.value.id)
    toast.success('Recurring transaction deleted')
    showForm.value = false
    editingRecurring.value = undefined
    await loadRecurrings()
  } catch (e) { toast.error('Failed to delete') }
}

const handleToggleActive = async (id: string, isActive: boolean) => {
  try { await repository.update(id, { isActive, updatedAt: new Date() }); await loadRecurrings() }
  catch (e) { toast.error('Failed to update') }
}

onMounted(loadRecurrings)
</script>
