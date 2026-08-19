<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Title -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill Name</label>
      <input v-model="form.title" type="text" required placeholder="e.g., Internet Bill" class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-gray-900 dark:text-white" />
    </div>

    <!-- Amount -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
      <DInputAmount v-model="form.amount" placeholder="0" :quick-amounts="[50000, 100000, 200000, 500000]" class="w-full" />
      <p v-if="errors.amount" class="mt-1.5 text-xs text-red-600">{{ errors.amount }}</p>
    </div>

    <!-- Due Date -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Next Due Date</label>
      <DDatePicker v-model="form.nextDueDate" required />
    </div>

    <!-- Frequency -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
      <div class="grid grid-cols-4 gap-2">
        <button v-for="freq in frequencies" :key="freq.value" type="button" :class="['py-2 rounded-lg text-sm font-medium transition-all', form.frequency === freq.value ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300']" @click="form.frequency = freq.value">
          {{ freq.label }}
        </button>
      </div>
    </div>

    <!-- Reminder Days Before -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remind me</label>
      <select v-model="form.reminderDays" class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 outline-none text-gray-900 dark:text-white">
        <option :value="1">1 day before</option>
        <option :value="3">3 days before</option>
        <option :value="7">7 days before</option>
        <option :value="14">14 days before</option>
      </select>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
      <textarea v-model="form.notes" rows="2" placeholder="Additional notes..." class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 outline-none text-gray-900 dark:text-white"></textarea>
    </div>

    <DButton type="submit" :loading="loading" class="w-full">{{ existingReminder ? 'Update' : 'Create' }} Reminder</DButton>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { BillReminder, ReminderFrequency } from '~modules/reminders/domain/entities/BillReminder'
import DInputAmount from '~modules/transactions/ui/molecules/DInputAmount.vue'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'
import DDatePicker from '~modules/transactions/ui/molecules/DDatePicker.vue'

interface Props { reminder?: BillReminder; loading?: boolean }
const props = withDefaults(defineProps<Props>(), { loading: false })
const emit = defineEmits<{ submit: [data: Partial<BillReminder>]; delete: [] }>()

const frequencies = [
  { value: 'monthly' as ReminderFrequency, label: 'Monthly' },
  { value: 'weekly' as ReminderFrequency, label: 'Weekly' },
  { value: 'yearly' as ReminderFrequency, label: 'Yearly' },
  { value: 'custom' as ReminderFrequency, label: 'Custom' }
]

const form = reactive({
  title: props.reminder?.title || '',
  amount: props.reminder?.amount || 0,
  nextDueDate: props.reminder?.nextDueDate ? new Date(props.reminder.nextDueDate).toISOString().split('T')[0] : '',
  frequency: (props.reminder?.frequency || 'monthly') as ReminderFrequency,
  reminderDays: props.reminder?.reminderDays || 3,
  notes: props.reminder?.notes || ''
})

const errors = reactive({ title: '', amount: '' })

const existingReminder = computed(() => !!props.reminder)

const validate = () => {
  errors.title = errors.amount = ''
  if (!form.title.trim()) { errors.title = 'Title is required'; return false }
  if (!form.amount || form.amount <= 0) { errors.amount = 'Amount must be greater than 0'; return false }
  return true
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', {
    title: form.title.trim(),
    amount: Number(form.amount),
    frequency: form.frequency,
    nextDueDate: new Date(form.nextDueDate),
    reminderDays: form.reminderDays,
    notes: form.notes.trim() || undefined
  })
}
</script>
