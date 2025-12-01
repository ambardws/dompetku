<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
    <!-- Navigation Items Container with max-width -->
    <div class="relative max-w-3xl mx-auto pointer-events-auto">
      <!-- Background with subtle blur - constrained to container -->
      <div class="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700"></div>
      
      <div class="relative flex items-center justify-around h-16 px-2">
        <!-- Navigation Items -->
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="relative flex flex-col items-center justify-center flex-1 h-full group transition-all duration-200"
        >
          <!-- Simple top indicator for active state -->
          <div 
            class="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200"
            :class="isActive(item.path) 
              ? 'w-8 bg-blue-600 dark:bg-blue-500' 
              : 'w-0 bg-transparent'"
          ></div>
          
          <!-- Icon -->
          <svg 
            class="transition-colors duration-200 mb-1"
            :class="isActive(item.path) 
              ? 'w-6 h-6 text-blue-600 dark:text-blue-500' 
              : 'w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              :d="item.iconPath"
            />
          </svg>
          
          <!-- Label -->
          <span 
            class="text-[10px] font-medium transition-colors duration-200"
            :class="isActive(item.path)
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'"
          >
            {{ item.label }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    path: '/',
    label: 'Beranda',
    iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    path: '/transactions',
    label: 'Transaksi',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    path: '/categories',
    label: 'Kategori',
    iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
  }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* Smooth entrance animation */
nav {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
