<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 pb-20 transition-colors">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl px-4 py-6 sm:py-8">
      <!-- Header -->
      <header class="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-5">
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            @click="router.push('/')"
            class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Back to dashboard"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="min-w-0 flex-1">
            <h1 class="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">Categories Management</h1>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate hidden xs:block">Manage your transaction categories</p>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Left: Create/Edit Form -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ editingCategory ? 'Edit Category' : 'Create New Category' }}
          </h2>

          <DCategoryForm
            :mode="editingCategory ? 'edit' : 'create'"
            :category="editingCategory || undefined"
            :loading="isSubmitting"
            @submit="handleSubmit"
            @cancel="cancelEdit"
          />
        </div>

        <!-- Right: Categories List -->
        <div class="space-y-4">
          <!-- Expense Categories -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Expense Categories
              </h2>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ expenseCategories.length }} categories
              </span>
            </div>

            <DCategorySkeleton v-if="isLoading" :count="3" />

            <div v-else-if="expenseCategories.length === 0" class="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No expense categories yet
            </div>

            <div v-else class="space-y-2">
              <DCategoryCard
                v-for="category in expenseCategories"
                :key="category.id"
                :category="category"
                @edit="startEdit"
                @delete="confirmDelete"
              />
            </div>
          </div>

          <!-- Income Categories -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Income Categories
              </h2>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ incomeCategories.length }} categories
              </span>
            </div>

            <DCategorySkeleton v-if="isLoading" :count="3" />

            <div v-else-if="incomeCategories.length === 0" class="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No income categories yet
            </div>

            <div v-else class="space-y-2">
              <DCategoryCard
                v-for="category in incomeCategories"
                :key="category.id"
                :category="category"
                @edit="startEdit"
                @delete="confirmDelete"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Category } from '~modules/categories/domain/entities/Category'
import { GetCategoriesUseCase } from '~modules/categories/application/use-cases/GetCategoriesUseCase'
import { AddCategoryUseCase } from '~modules/categories/application/use-cases/AddCategoryUseCase'
import { UpdateCategoryUseCase } from '~modules/categories/application/use-cases/UpdateCategoryUseCase'
import { DeleteCategoryUseCase } from '~modules/categories/application/use-cases/DeleteCategoryUseCase'
import { InitializeDefaultCategoriesUseCase } from '~modules/categories/application/use-cases/InitializeDefaultCategoriesUseCase'
import DCategoryForm from '~modules/categories/ui/organisms/DCategoryForm.vue'
import DCategoryCard from '~modules/categories/ui/molecules/DCategoryCard.vue'
import DCategorySkeleton from '~modules/categories/ui/molecules/DCategorySkeleton.vue'
import { useAuth } from '~shared/composables/useAuth'
import { useCategoryRepository } from '~shared/composables/useCategoryRepository'
import { useToast } from '~shared/composables/useToast'
import { useConfirm } from '~shared/composables/useConfirm'

// Add auth middleware
definePageMeta({
  middleware: [
    function (to, from) {
      const { user } = useAuth()
      if (!user.value) {
        return navigateTo('/login')
      }
      
      if (user.value) {
        return true
      }
    }
  ]
})

const router = useRouter()
const { user } = useAuth()
const categoryRepository = useCategoryRepository()
const toast = useToast()
const confirm = useConfirm()

const categories = ref<Category[]>([])
const editingCategory = ref<Category | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)

const expenseCategories = computed(() =>
  categories.value.filter((cat) => cat.type === 'expense')
)

const incomeCategories = computed(() =>
  categories.value.filter((cat) => cat.type === 'income')
)

async function loadCategories() {
  if (!user.value?.id) return

  isLoading.value = true
  try {
    const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository)
    categories.value = await getCategoriesUseCase.execute({ userId: user.value.id })

    // Initialize defaults if no categories
    if (categories.value.length === 0) {
      const initUseCase = new InitializeDefaultCategoriesUseCase(categoryRepository)
      categories.value = await initUseCase.execute(user.value.id)
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
    toast.error('Failed to load categories')
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(data: {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}) {
  if (!user.value?.id) return

  isSubmitting.value = true
  try {
    if (editingCategory.value) {
      // Update existing category
      const updateUseCase = new UpdateCategoryUseCase(categoryRepository)
      const updated = await updateUseCase.execute(editingCategory.value.id, {
        name: data.name,
        icon: data.icon,
        color: data.color,
      })

      // Update in list
      const index = categories.value.findIndex((c) => c.id === updated.id)
      if (index !== -1) {
        categories.value[index] = updated
      }

      toast.success('Category updated successfully')
      editingCategory.value = null
    } else {
      // Create new category
      const addUseCase = new AddCategoryUseCase(categoryRepository)
      const newCategory = await addUseCase.execute({
        userId: user.value.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
      })

      categories.value.push(newCategory)
      toast.success('Category created successfully')
    }
  } catch (error) {
    console.error('Failed to save category:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to save category')
  } finally {
    isSubmitting.value = false
  }
}

function startEdit(category: Category) {
  editingCategory.value = category
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingCategory.value = null
}

async function confirmDelete(category: Category) {
  const confirmed = await confirm.danger(
    'Hapus Kategori',
    `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Kategori yang sudah digunakan dalam transaksi tidak dapat dihapus.`,
    'Ya, Hapus',
    'Batal'
  )

  if (!confirmed) return

  try {
    const deleteUseCase = new DeleteCategoryUseCase(categoryRepository)
    await deleteUseCase.execute(category.id)

    // Remove from list
    categories.value = categories.value.filter((c) => c.id !== category.id)

    // Cancel edit if deleting the category being edited
    if (editingCategory.value?.id === category.id) {
      editingCategory.value = null
    }

    toast.success('Category deleted successfully')
  } catch (error) {
    console.error('Failed to delete category:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to delete category')
  }
}

onMounted(() => {
  loadCategories()
})
</script>
