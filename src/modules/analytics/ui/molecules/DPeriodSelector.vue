<template>
  <div class="period-selector w-full">
    <DDatePickerRange
      v-model="periodValue"
      placeholder="Select date period"
      @update:model-value="handlePeriodChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DDatePickerRange from './DDatePickerRange.vue'

export interface PeriodValue {
  from: Date
  to: Date
}

interface Props {
  modelValue?: PeriodValue
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  }),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: PeriodValue): void
}>()

const periodValue = ref<PeriodValue | undefined>(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  periodValue.value = newValue
}, { deep: true })

const handlePeriodChange = (value: PeriodValue | undefined) => {
  if (value) {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.period-selector {
  @apply w-full;
}
</style>
