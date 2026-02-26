<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Button -->
    <button
      type="button"
      :disabled="disabled"
      :class="inputClasses"
      class="w-full rounded-xl border px-4 py-3 transition-all duration-300 focus:outline-none text-left flex items-center justify-between"
      @click="openModal"
    >
      <span :class="displayValue ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'">
        {{ displayText }}
      </span>

      <!-- Right Icon -->
      <div class="flex items-center">
        <button
          v-if="modelValue && !disabled"
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          @click.stop="clearDate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div v-else class="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ml-auto"
             :class="isOpen ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
      </div>
    </button>

    <!-- Modal/Popup Calendar -->
    <Teleport to="body">
      <div
        v-show="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click="closeModal"
      >
        <!-- Backdrop with fade animation -->
        <Transition
          enter-active-class="transition-opacity duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-show="isOpen" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </Transition>

        <!-- Modal Content with Slide Up Animation -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-full opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-full opacity-0"
        >
          <div
            v-show="isOpen"
            class="relative bg-white dark:bg-gray-800 w-full sm:w-auto sm:min-w-[320px] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden"
            @click.stop
          >
            <!-- Handle Bar (Mobile) -->
            <div class="flex justify-center pt-3 pb-1 sm:hidden">
              <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            <!-- Header -->
            <div class="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                  @click="previousMonth"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <div class="text-center">
                  <button
                    type="button"
                    class="text-lg font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                    @click="goToToday"
                  >
                    {{ currentMonth }} {{ currentYear }}
                  </button>
                </div>

                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                  @click="nextMonth"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-0.5 px-2 py-2 bg-gray-50 dark:bg-gray-900/30">
              <div
                v-for="day in weekdayNames"
                :key="day"
                class="text-xs font-semibold text-center text-gray-500 dark:text-gray-400 py-1.5"
              >
                {{ day }}
              </div>
            </div>

            <!-- Calendar Days (Fixed Height - 6 rows = 42 cells) -->
            <div class="px-2 py-3 h-[280px] sm:h-[300px]">
              <div class="grid grid-cols-7 gap-0.5 h-full">
                <!-- Empty cells for first week padding -->
                <div
                  v-for="n in firstDayOfWeek"
                  :key="'empty-' + n"
                  class="aspect-square"
                ></div>

                <!-- Day cells -->
                <button
                  v-for="date in daysInMonth.days"
                  :key="date.day"
                  type="button"
                  :class="[
                    'aspect-square rounded-lg text-sm font-medium transition-all duration-150 relative',
                    date.isToday && !date.isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                    date.isSelected
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300'
                  ]"
                  @click="selectDate(date)"
                >
                  <span class="relative z-10">{{ date.day }}</span>
                  <span
                    v-if="date.isToday && !date.isSelected"
                    class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                  ></span>
                </button>

                <!-- Empty cells for padding to always show 6 rows (42 total cells) -->
                <div
                  v-for="n in (42 - firstDayOfWeek - daysInMonth.totalDays)"
                  :key="'pad-' + n"
                  class="aspect-square"
                ></div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                type="button"
                class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                @click="goToToday"
              >
                Today
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors shadow-md"
                @click="closeModal"
              >
                Close
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Teleport>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>{{ error }}
    </p>

    <!-- Hint Message -->
    <p v-else-if="hint" class="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>{{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: string // YYYY-MM-DD format
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih tanggal',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const isOpen = ref(false)
const viewDate = ref(new Date())

// Month names in English
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonth = computed(() => monthNames[viewDate.value.getMonth()])
const currentYear = computed(() => viewDate.value.getFullYear())

const displayValue = computed(() => props.modelValue)

const displayText = computed(() => {
  if (!props.modelValue) return props.placeholder

  const date = new Date(props.modelValue)
  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
})

const inputClasses = computed(() => {
  const classes = []

  if (props.error) {
    classes.push('border-red-300 dark:border-red-600')
  } else if (isOpen.value) {
    classes.push('border-primary-500 dark:border-primary-400')
  } else {
    classes.push('border-gray-300 dark:border-gray-600')
  }

  if (props.disabled) {
    classes.push('cursor-not-allowed opacity-60')
  } else {
    classes.push('hover:border-primary-300 dark:hover:border-primary-500')
  }

  if (!props.disabled) {
    classes.push('bg-white dark:bg-gray-700')
  } else {
    classes.push('bg-gray-100 dark:bg-gray-800')
  }

  return classes.join(' ')
})

const firstDayOfWeek = computed(() => {
  const firstDay = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1)
  return firstDay.getDay()
})

const daysInMonth = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDate = props.modelValue ? new Date(props.modelValue) : null
  if (selectedDate) {
    selectedDate.setHours(0, 0, 0, 0)
  }

  return {
    days: Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(year, month, i + 1)
      date.setHours(0, 0, 0, 0)

      return {
        day: i + 1,
        date: date,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isOtherMonth: false
      }
    }),
    totalDays
  }
})

const openModal = () => {
  if (props.disabled) return
  isOpen.value = true

  if (props.modelValue) {
    viewDate.value = new Date(props.modelValue)
  }
}

const closeModal = () => {
  isOpen.value = false
}

const selectDate = (dateInfo: { day: number; date: Date }) => {
  const year = dateInfo.date.getFullYear()
  const month = String(dateInfo.date.getMonth() + 1).padStart(2, '0')
  const day = String(dateInfo.date.getDate()).padStart(2, '0')

  emit('update:modelValue', `${year}-${month}-${day}`)
  closeModal()
}

const clearDate = () => {
  emit('update:modelValue', undefined)
}

const previousMonth = () => {
  const newDate = new Date(viewDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  viewDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(viewDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  viewDate.value = newDate
}

const goToToday = () => {
  viewDate.value = new Date()
}
</script>
