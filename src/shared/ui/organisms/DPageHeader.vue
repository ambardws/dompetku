<template>
  <header class="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-5">
    <div class="flex items-center justify-between gap-2">
      <!-- Logo & Title -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <!-- Back Button (optional) -->
        <button
          v-if="showBackButton"
          @click="$emit('back')"
          class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 bg-gray-900 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg sm:text-xl">
          {{ icon }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{{ title }}</h1>
          <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate hidden xs:block">{{ subtitle }}</p>
        </div>
      </div>

      <!-- User Info & Actions -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <div v-if="userEmail" class="hidden lg:block text-right mr-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">Logged in as</p>
          <p class="text-xs font-semibold text-gray-900 dark:text-white">{{ userEmail }}</p>
        </div>

        <slot name="notification" />

        <slot name="dark-mode-toggle" />

        <slot name="actions">
          <button
            v-if="showLogout"
            @click="$emit('logout')"
            class="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg
                   transition-all duration-200"
          >
            Logout
          </button>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  icon?: string
  userEmail?: string
  showLogout?: boolean
  showBackButton?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: '💰',
  showLogout: true,
  showBackButton: false
})

defineEmits<{
  logout: []
  back: []
}>()
</script>
