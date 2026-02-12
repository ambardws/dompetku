<template>
  <div class="w-full">
    <!-- Input Button -->
    <button
      type="button"
      :disabled="disabled"
      :class="inputClasses"
      class="w-full rounded-lg border px-2.5 py-2 transition-all duration-300 focus:outline-none text-left flex items-center gap-2"
      @click="openModal"
    >
      <!-- Calendar Icon -->
      <div class="flex items-center justify-center w-6 h-6 rounded transition-all duration-300 flex-shrink-0"
           :class="isOpen ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      <!-- Range Text -->
      <span :class="displayText ? 'text-gray-900 dark:text-white font-semibold text-xs' : 'text-gray-400 dark:text-gray-500 text-xs'" class="flex-1 min-w-0">
        {{ displayText || placeholder }}
      </span>
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
            class="relative bg-white dark:bg-gray-800 w-full sm:w-auto sm:min-w-[400px] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden"
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
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

            <!-- Calendar Days -->
            <div class="px-2 py-3">
              <div class="grid grid-cols-7 gap-0.5">
                <!-- Empty cells for first week padding -->
                <div
                  v-for="n in firstDayOfWeek"
                  :key="'empty-' + n"
                  class="aspect-square"
                ></div>

                <!-- Day cells with range selection -->
                <button
                  v-for="date in daysInMonth.days"
                  :key="date.day"
                  type="button"
                  :class="getDateClasses(date)"
                  @click="selectDate(date)"
                  @mouseenter="onDateMouseEnter(date)"
                  @mouseleave="onDateMouseLeave"
                >
                  <span class="relative z-10">{{ date.day }}</span>
                  <span
                    v-if="date.isToday && !date.isSelected && !date.isInRange"
                    class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                  ></span>
                </button>

                <!-- Empty cells for padding -->
                <div
                  v-for="n in (42 - firstDayOfWeek - daysInMonth.totalDays)"
                  :key="'pad-' + n"
                  class="aspect-square"
                ></div>
              </div>
            </div>

            <!-- Footer with Quick Select -->
            <div class="border-t border-gray-200 dark:border-gray-700">
              <!-- Quick Select Buttons -->
              <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Pilih Cepat
                </p>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="preset in quickPresets"
                    :key="preset.value"
                    type="button"
                    @click="selectPreset(preset)"
                    class="px-2 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-gray-700 dark:text-gray-300"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="px-3 py-3 flex gap-2">
                <button
                  type="button"
                  class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  @click="closeModal"
                >
                  Batal
                </button>
                <button
                  type="button"
                  :disabled="!tempFromDate || !tempToDate"
                  class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md"
                  @click="applyRange"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DateInfo {
  day: number
  date: Date
  isToday: boolean
  isSelected: boolean | null
  isInRange: boolean | null
  isRangeStart: boolean | null
  isRangeEnd: boolean | null
}

interface QuickPreset {
  label: string
  value: string
  from: Date
  to: Date
}

interface Props {
  modelValue?: { from: Date; to: Date }
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih periode tanggal',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: { from: Date; to: Date } | undefined]
}>()

// Month names in Indonesian
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

const weekdayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// Quick preset options
const quickPresets: QuickPreset[] = [
  {
    label: '7 Hari',
    value: '7-days',
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  },
  {
    label: '30 Hari',
    value: '30-days',
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  },
  {
    label: 'Bulan Ini',
    value: 'mtd',
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  },
  {
    label: 'Bulan Lalu',
    value: 'last-month',
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59),
  },
]

const isOpen = ref(false)
const viewDate = ref(new Date())
const tempFromDate = ref('')
const tempToDate = ref('')
const hoverDate = ref<Date | null>(null)

const currentMonth = computed(() => monthNames[viewDate.value.getMonth()])
const currentYear = computed(() => viewDate.value.getFullYear())

const displayText = computed(() => {
  if (!props.modelValue || !props.modelValue.from || !props.modelValue.to) return ''

  const from = new Date(props.modelValue.from)
  const to = new Date(props.modelValue.to)

  return `${from.getDate()} ${monthNames[from.getMonth()]} ${from.getFullYear()} → ${to.getDate()} ${monthNames[to.getMonth()]} ${to.getFullYear()}`
})

const inputClasses = computed(() => {
  const classes = []

  if (isOpen.value) {
    classes.push('border-primary-500 dark:border-primary-400')
  } else {
    classes.push('border-gray-300 dark:border-gray-600')
  }

  if (!props.disabled) {
    classes.push('hover:border-primary-300 dark:hover:border-primary-500', 'bg-white dark:bg-gray-700')
  } else {
    classes.push('cursor-not-allowed opacity-60', 'bg-gray-100 dark:bg-gray-800')
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

  // Parse temp dates for comparison
  let fromDate: Date | null = null
  let toDate: Date | null = null

  if (tempFromDate.value) {
    const parts = tempFromDate.value.split('-').map(Number)
    fromDate = new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1, 0, 0, 0, 0)
  }

  if (tempToDate.value) {
    const parts = tempToDate.value.split('-').map(Number)
    toDate = new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1, 0, 0, 0, 0)
  }

  return {
    days: Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(year, month, i + 1, 0, 0, 0, 0)

      const isSelected = (fromDate && date.getTime() === fromDate.getTime()) ||
                       (toDate && date.getTime() === toDate.getTime())

      const isInRange = fromDate && toDate &&
                       date.getTime() >= fromDate.getTime() &&
                       date.getTime() <= toDate.getTime()

      const isRangeStart = fromDate && date.getTime() === fromDate.getTime()
      const isRangeEnd = toDate && date.getTime() === toDate.getTime()

      return {
        day: i + 1,
        date: date,
        isToday: date.getTime() === today.getTime(),
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd
      }
    }),
    totalDays
  }
})

const getDateClasses = (dateInfo: DateInfo) => {
  const classes = [
    'aspect-square rounded-lg text-sm font-medium transition-all duration-150 relative'
  ]

  if (dateInfo.isRangeStart || dateInfo.isRangeEnd) {
    classes.push('bg-primary-500 text-white shadow-md')
  } else if (dateInfo.isInRange) {
    classes.push('bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300')
  } else if (dateInfo.isSelected) {
    classes.push('bg-primary-500 text-white shadow-md')
  } else if (dateInfo.isToday) {
    classes.push('bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold')
  } else {
    classes.push('hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300')
  }

  // Rounded corners for range
  if (dateInfo.isInRange) {
    if (dateInfo.isRangeStart) {
      classes.push('rounded-r-lg rounded-l-none')
    } else if (dateInfo.isRangeEnd) {
      classes.push('rounded-l-lg rounded-r-none')
    } else {
      classes.push('rounded-none')
    }
  }

  return classes.join(' ')
}

const openModal = () => {
  if (props.disabled) return
  isOpen.value = true

  // Set temp values from current modelValue
  if (props.modelValue?.from) {
    const from = new Date(props.modelValue.from)
    const year = from.getFullYear()
    const month = String(from.getMonth() + 1).padStart(2, '0')
    const day = String(from.getDate()).padStart(2, '0')
    tempFromDate.value = `${year}-${month}-${day}`
    viewDate.value = from
  }
  if (props.modelValue?.to) {
    const to = new Date(props.modelValue.to)
    const year = to.getFullYear()
    const month = String(to.getMonth() + 1).padStart(2, '0')
    const day = String(to.getDate()).padStart(2, '0')
    tempToDate.value = `${year}-${month}-${day}`
  }
}

const closeModal = () => {
  isOpen.value = false
  hoverDate.value = null
}

const selectDate = (dateInfo: DateInfo) => {
  // Use local date string to avoid timezone issues
  const year = dateInfo.date.getFullYear()
  const month = String(dateInfo.date.getMonth() + 1).padStart(2, '0')
  const day = String(dateInfo.date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  if (!tempFromDate.value || (tempFromDate.value && tempToDate.value)) {
    // Start new range
    tempFromDate.value = dateStr
    tempToDate.value = ''
  } else if (!tempToDate.value) {
    // Complete range
    const fromDate = new Date(tempFromDate.value + 'T00:00:00')
    const toDate = dateInfo.date

    if (toDate < fromDate) {
      // If selected date is before from date, swap them
      tempToDate.value = tempFromDate.value
      tempFromDate.value = dateStr
    } else {
      tempToDate.value = dateStr
    }
  }
}

const onDateMouseEnter = (dateInfo: DateInfo) => {
  if (tempFromDate.value && !tempToDate.value) {
    hoverDate.value = dateInfo.date
  }
}

const onDateMouseLeave = () => {
  // Keep hover for visual feedback
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

const selectPreset = (preset: QuickPreset) => {
  const year = preset.from.getFullYear()
  const month = String(preset.from.getMonth() + 1).padStart(2, '0')
  const day = String(preset.from.getDate()).padStart(2, '0')
  tempFromDate.value = `${year}-${month}-${day}`

  const year2 = preset.to.getFullYear()
  const month2 = String(preset.to.getMonth() + 1).padStart(2, '0')
  const day2 = String(preset.to.getDate()).padStart(2, '0')
  tempToDate.value = `${year2}-${month2}-${day2}`
}

const applyRange = () => {
  if (!tempFromDate.value || !tempToDate.value) {
    return
  }

  // Parse dates using local time (not UTC) to avoid timezone issues
  const fromParts = tempFromDate.value.split('-').map(Number)
  const toParts = tempToDate.value.split('-').map(Number)

  const fromDate = new Date(fromParts[0] ?? 0, (fromParts[1] ?? 1) - 1, fromParts[2] ?? 1, 0, 0, 0, 0)
  const toDate = new Date(toParts[0] ?? 0, (toParts[1] ?? 1) - 1, toParts[2] ?? 1, 23, 59, 59, 999)

  emit('update:modelValue', { from: fromDate, to: toDate })
  closeModal()
}

const clearRange = () => {
  emit('update:modelValue', undefined)
  tempFromDate.value = ''
  tempToDate.value = ''
}
</script>
