<template>
  <NuxtLayout>
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Bill Reminders</h1>
      <button @click="showForm = true" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors">
        + Add Reminder
      </button>
    </div>

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

    <DBillReminderList
      :reminders="reminders"
      :loading="loading"
      @toggle-active="handleToggleActive"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { BillReminder } from '~/modules/reminders/domain/entities/BillReminder'
import { useAuth } from '~shared/composables/useAuth'
import { useBillReminderRepository } from '~shared/composables/useBillReminderRepository'
import { useToast } from '~shared/composables/useToast'
import DBillReminderList from '~/modules/reminders/ui/organisms/DBillReminderList.vue'
import DBillReminderForm from '~/modules/reminders/ui/molecules/DBillReminderForm.vue'

definePageMeta({ layout: 'default' })

const pageMeta = { title: 'Bill Reminders', subtitle: 'Never miss a payment', icon: 'bell', showBackButton: true, showFAB: false }
provide('pageMeta', pageMeta)

const { user } = useAuth()
const { repository } = useBillReminderRepository()
const toast = useToast()

const reminders = ref<BillReminder[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingReminder = ref<BillReminder | undefined>()

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
      })
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
