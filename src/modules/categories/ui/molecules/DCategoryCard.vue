<template>
  <div
    class="category-card p-3 rounded-lg border transition-all hover:border-gray-300"
  >
    <div class="flex items-center justify-between">
      <!-- Category Info -->
      <div class="flex items-center gap-3 flex-1">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-100"
        >
          {{ category.icon }}
        </div>

        <div class="flex-1">
          <h3 class="text-sm font-semibold text-gray-900">{{ category.name }}</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span
              :class="[
                'text-xs px-2 py-0.5 rounded-full font-medium',
                category.type === 'income'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-orange-50 text-orange-700'
              ]"
            >
              {{ category.type === 'income' ? 'Income' : 'Expense' }}
            </span>
            <span
              v-if="category.isDefault"
              class="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600"
            >
              Default
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="!category.isDefault" class="flex items-center gap-1">
        <button
          type="button"
          class="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="Edit category"
          @click="$emit('edit', category)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          type="button"
          class="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="Delete category"
          @click="$emit('delete', category)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div v-else class="text-xs text-gray-400">
        Cannot edit/delete
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '~modules/categories/domain/entities/Category'

interface Props {
  category: Category
}

interface Emits {
  (e: 'edit', category: Category): void
  (e: 'delete', category: Category): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

</script>

<style scoped>
.category-card {
  @apply bg-white border-gray-200;
}
</style>
