<template>
  <NuxtLayout>
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Recurring Transactions</h1>
      <button @click="showForm = true" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
        + Add Recurring
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

    <DRecurringList
      :recurrings="recurrings"
      :loading="loading"
      @toggle-active="handleToggleActive"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { RecurringTransaction } from '~/modules/recurring/domain/entities/RecurringTransaction'
import { useAuth } from '~shared/composables/useAuth'
import { useRecurringTransactionRepository } from '~shared/composables/useRecurringTransactionRepository'
import { useToast } from '~shared/composables/useToast'
import DRecurringList from '~/modules/recurring/ui/organisms/DRecurringList.vue'
import DRecurringForm from '~/modules/recurring/ui/molecules/DRecurringForm.vue'

definePageMeta({ layout: 'default' })

const pageMeta = {
  title: 'Recurring Transactions',
  subtitle: 'Automated regular transactions',
  icon: 'refresh',
  showBackButton: true,
  showFAB: false
}
provide('pageMeta', pageMeta)

const { user } = useAuth()
const { repository } = useRecurringTransactionRepository()
const toast = useToast()

const recurrings = ref<RecurringTransaction[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingRecurring = ref<RecurringTransaction | undefined>()

const loadRecurrings = async () => {
  if (!user.value?.id) return
  loading.value = true
  try {
    recurrings.value = await repository.getByUserId(user.value.id)
  } catch (e) {
    toast.error('Failed to load recurring transactions')
  } finally {
    loading.value = false
  }
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
      })
      toast.success('Recurring transaction created')
    }
    showForm.value = false
    editingRecurring.value = undefined
    await loadRecurrings()
  } catch (e) {
    toast.error('Failed to save recurring transaction')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!editingRecurring.value) return
  try {
    await repository.delete(editingRecurring.value.id)
    toast.success('Recurring transaction deleted')
    showForm.value = false
    editingRecurring.value = undefined
    await loadRecurrings()
  } catch (e) {
    toast.error('Failed to delete')
  }
}

const handleToggleActive = async (id: string, isActive: boolean) => {
  try {
    await repository.update(id, { isActive, updatedAt: new Date() })
    await loadRecurrings()
  } catch (e) {
    toast.error('Failed to update')
  }
}

onMounted(loadRecurrings)
</script>
