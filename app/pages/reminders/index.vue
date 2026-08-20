<template>
  <div class="bg-gray-100 dark:bg-gray-950 pb-16 transition-colors">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8 pb-24">
      <!-- Page Header -->
      <DPageHeader
        title="Bill Reminders"
        subtitle="Never miss a payment"
        icon="bell"
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

      <!-- Add Button (Minimalist) -->
      <button
        @click="showForm = true"
        class="inline-flex items-center gap-2 px-3 py-2 mb-4 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800 transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Reminder
      </button>

      <!-- Form Dialog -->
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showForm = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold mb-4 text-slate-800 dark:text-white">
            {{ editingReminder ? 'Edit' : 'New' }} Bill Reminder
          </h2>
          <DBillReminderForm
            :reminder="editingReminder"
            :loading="saving"
            @submit="handleSubmit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Reminders List -->
      <DBillReminderList
        :reminders="reminders"
        :loading="loading"
        @toggle-active="handleToggleActive"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { BillReminder } from '~modules/reminders/domain/entities/BillReminder'
import { useAuth } from '~shared/composables/useAuth'
import { useBillReminderRepository } from '~shared/composables/useBillReminderRepository'
import { useToast } from '~shared/composables/useToast'
import { useDarkMode } from '~shared/composables/useDarkMode'
import { useSharedHeader } from '~shared/composables/useSharedHeader'
import DBillReminderList from '~modules/reminders/ui/organisms/DBillReminderList.vue'
import DBillReminderForm from '~modules/reminders/ui/molecules/DBillReminderForm.vue'
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
const { repository } = useBillReminderRepository()
const toast = useToast()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const { handleLogout } = useSharedHeader()

const reminders = ref<BillReminder[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingReminder = ref<BillReminder | undefined>()

const handleBack = () => router.push('/')

const loadReminders = async () => {
  if (!user.value?.id) return
  loading.value = true
  try { reminders.value = await repository.getByUserId(user.value.id) }
  catch (e) { toast.error('Failed to load reminders') }
  finally { loading.value = false }
}

const handleSubmit = async (data: Partial<BillReminder>) => {
  if (!user.value?.id) return
  saving.value = true
  try {
    if (editingReminder.value) {
      await repository.update(editingReminder.value.id, data)
      toast.success('Reminder updated')
    } else {
      await repository.add({
        id: '', userId: user.value.id, title: data.title!, amount: data.amount!,
        frequency: data.frequency!, nextDueDate: data.nextDueDate!,
        reminderDays: data.reminderDays || 3, isActive: true,
        notes: data.notes, createdAt: new Date(), updatedAt: new Date()
      } as BillReminder)
      toast.success('Reminder created')
    }
    showForm.value = false
    editingReminder.value = undefined
    await loadReminders()
  } catch (e) { toast.error('Failed to save') }
  finally { saving.value = false }
}

const handleDelete = async () => {
  if (!editingReminder.value) return
  try {
    await repository.delete(editingReminder.value.id)
    toast.success('Reminder deleted')
    showForm.value = false
    editingReminder.value = undefined
    await loadReminders()
  } catch (e) { toast.error('Failed to delete') }
}

const handleToggleActive = async (id: string, isActive: boolean) => {
  try { await repository.update(id, { isActive }); await loadReminders() }
  catch (e) { toast.error('Failed to update') }
}

onMounted(loadReminders)
</script>
