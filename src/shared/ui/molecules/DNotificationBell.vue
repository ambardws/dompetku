<template>
  <div class="relative" ref="notificationRef">
    <!-- Bell Icon Button -->
    <button
      @click.stop="toggleDropdown"
      class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :class="{ 'bg-gray-100 dark:bg-gray-700': isOpen }"
      type="button"
    >
      <!-- Bell Icon -->
      <svg
        class="w-6 h-6 text-gray-700 dark:text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Badge for unread count -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Mobile Backdrop -->
    <transition
      enter-active-class="transition-opacity ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 sm:hidden"
        @click="closeDropdown"
      ></div>
    </transition>

    <!-- Dropdown Panel -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        @click.stop
        class="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] sm:max-h-[400px] flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-3 py-2.5 sm:py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm sm:text-sm font-bold text-gray-900 dark:text-white">
            Notifikasi
          </h3>
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium whitespace-nowrap"
            type="button"
          >
            Tandai dibaca
          </button>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto flex-1">
          <div v-if="notifications.length === 0" class="px-3 py-8 text-center">
            <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Belum ada notifikasi</p>
          </div>

          <div v-else>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              class="px-3 py-2.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-600"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.read }"
            >
              <div class="flex items-start gap-2">
                <!-- Icon -->
                <div class="flex-shrink-0 text-lg sm:text-lg leading-none mt-0.5">
                  {{ notification.icon || '🔔' }}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p
                      class="text-sm sm:text-xs font-semibold text-gray-900 dark:text-white leading-tight"
                      :class="{ 'font-bold': !notification.read }"
                    >
                      {{ notification.title }}
                    </p>
                    <span
                      v-if="!notification.read"
                      class="flex-shrink-0 w-2 h-2 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full mt-1"
                    ></span>
                  </div>
                  <p class="text-xs sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                    {{ notification.message }}
                  </p>
                  <p class="text-[11px] sm:text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                    {{ formatTimestamp(notification.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="notifications.length > 0"
          class="px-3 py-2 sm:py-2 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            @click="handleClearAll"
            class="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 sm:py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
            type="button"
          >
            Hapus semua
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '~shared/composables/useNotifications'
import type { Notification } from '~shared/composables/useNotifications'

const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()
const isOpen = ref(false)
const notificationRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
}

const handleMarkAllAsRead = () => {
  markAllAsRead()
}

const handleClearAll = () => {
  if (confirm('Hapus semua notifikasi?')) {
    clearAll()
    closeDropdown()
  }
}

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Baru saja'
  } else if (minutes < 60) {
    return `${minutes} menit yang lalu`
  } else if (hours < 24) {
    return `${hours} jam yang lalu`
  } else if (days < 7) {
    return `${days} hari yang lalu`
  } else {
    return timestamp.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}
</script>
