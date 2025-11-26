<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- Type Selector -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Type <span class="text-gray-400 dark:text-gray-500">*</span>
      </label>
      <div class="flex gap-3">
        <button
          v-for="type in categoryTypes"
          :key="type.value"
          type="button"
          :class="[
            'flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm',
            formData.type === type.value
              ? type.value === 'expense'
                ? 'bg-orange-600 dark:bg-orange-700 text-white'
                : 'bg-emerald-600 dark:bg-emerald-700 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
          :disabled="mode === 'edit'"
          @click="formData.type = type.value"
        >
          {{ type.label }}
        </button>
      </div>
      <p v-if="mode === 'edit'" class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Type cannot be changed after creation
      </p>
    </div>

    <!-- Name Input -->
    <DTextInput
      v-model="formData.name"
      label="Category Name"
      placeholder="e.g., Food & Dining"
      required
      :error="errors.name"
      @blur="validateName"
    />

    <!-- Icon Picker -->
    <DIconPicker
      v-model="formData.icon"
      label="Icon"
      placeholder="Select an icon"
      required
      :error="errors.icon"
    />

    <!-- Color Picker -->
    <DColorPicker
      v-model="formData.color"
      label="Color"
      required
      :error="errors.color"
    />

    <!-- Buttons -->
    <div class="flex gap-2 pt-1">
      <DButton
        v-if="mode === 'edit'"
        variant="secondary"
        type="button"
        @click="handleCancel"
      >
        Cancel
      </DButton>

      <DButton
        type="submit"
        :loading="loading"
        :full-width="mode === 'create'"
      >
        {{ mode === 'create' ? 'Create Category' : 'Save Changes' }}
      </DButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Category } from '~modules/categories/domain/entities/Category'
import DTextInput from '~modules/transactions/ui/atoms/DTextInput.vue'
import DIconPicker from '~modules/categories/ui/molecules/DIconPicker.vue'
import DColorPicker from '~modules/categories/ui/molecules/DColorPicker.vue'
import DButton from '~modules/transactions/ui/atoms/DButton.vue'

interface Props {
  mode?: 'create' | 'edit'
  category?: Category
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: {
    name: string
    icon: string
    color: string
    type: 'income' | 'expense'
  }): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  loading: false,
})

const emit = defineEmits<Emits>()

const categoryTypes = [
  { value: 'expense' as const, label: 'Expense' },
  { value: 'income' as const, label: 'Income' },
]

const formData = reactive({
  name: '',
  icon: '',
  color: '#6B7280',
  type: 'expense' as 'income' | 'expense',
})

const errors = reactive({
  name: '',
  icon: '',
  color: '',
})

function resetErrors() {
  errors.name = ''
  errors.icon = ''
  errors.color = ''
}

function validateName() {
  if (!formData.name.trim()) {
    errors.name = 'Category name is required'
    return false
  }
  errors.name = ''
  return true
}

function validateForm(): boolean {
  resetErrors()
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Category name is required'
    isValid = false
  }

  if (!formData.icon.trim()) {
    errors.icon = 'Icon is required'
    isValid = false
  }

  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (!hexColorRegex.test(formData.color)) {
    errors.color = 'Invalid color format'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validateForm()) return

  emit('submit', {
    name: formData.name.trim(),
    icon: formData.icon,
    color: formData.color,
    type: formData.type,
  })

  if (props.mode === 'create') {
    resetForm()
  }
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

function resetForm() {
  formData.name = ''
  formData.icon = ''
  formData.color = '#6B7280'
  formData.type = 'expense'
  resetErrors()
}

// Watch for category prop changes (edit mode)
watch(
  () => props.category,
  (category) => {
    if (category && props.mode === 'edit') {
      formData.name = category.name
      formData.icon = category.icon
      formData.color = category.color
      formData.type = category.type
    }
  },
  { immediate: true }
)
</script>
