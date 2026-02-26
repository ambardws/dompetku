<template>
  <header class="mb-4 sm:mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-5 shadow-sm">
    <div class="flex items-center justify-between gap-2">
      <!-- Logo & Title -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <!-- Back Button (optional) -->
        <button
          v-if="showBackButton"
          @click="$emit('back')"
          class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Icon -->
        <div class="w-10 h-10 flex-shrink-0 bg-indigo-700 dark:bg-slate-700 rounded-lg flex items-center justify-center text-white shadow-sm">
          <svg v-if="icon === 'wallet'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          <svg v-else-if="icon === 'list'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <svg v-else-if="icon === 'tag'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <svg v-else-if="icon === 'plus'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white truncate">{{ title }}</h1>
          <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">{{ subtitle }}</p>
        </div>
      </div>

      <!-- User Info & Actions -->
      <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div v-if="userEmail" class="hidden lg:block text-right mr-1 sm:mr-2">
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Login sebagai</p>
          <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{{ userEmail }}</p>
        </div>

        <slot name="notification" />

        <slot name="dark-mode-toggle" />

        <slot name="actions">
          <!-- Actions menu (hamburger) will be here -->
        </slot>

        <slot name="actions-menu" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  icon?: 'wallet' | 'list' | 'tag' | 'plus' | string
  userEmail?: string
  showBackButton?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: 'wallet',
  showBackButton: false
})

defineEmits<{
  logout: []
  back: []
}>()
</script>
