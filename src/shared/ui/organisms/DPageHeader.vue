<template>
  <header class="mb-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
    <div class="flex items-center justify-between">
      <!-- Logo & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-xl">
          {{ icon }}
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ title }}</h1>
          <p class="text-xs text-gray-500">{{ subtitle }}</p>
        </div>
      </div>

      <!-- User Info & Actions -->
      <div class="flex items-center gap-3">
        <div v-if="userEmail" class="hidden sm:block text-right">
          <p class="text-xs text-gray-500">Logged in as</p>
          <p class="text-xs font-semibold text-gray-900">{{ userEmail }}</p>
        </div>
        <slot name="actions">
          <button
            v-if="showLogout"
            @click="$emit('logout')"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900
                   bg-gray-100 hover:bg-gray-200 rounded-lg
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
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: '💰',
  showLogout: true
})

defineEmits<{
  logout: []
}>()
</script>
