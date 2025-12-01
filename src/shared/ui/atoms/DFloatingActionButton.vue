<template>
  <div class="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
    <div class="max-w-3xl mx-auto px-6 pb-24 pointer-events-none">
      <div class="flex justify-end pointer-events-auto">
        <button
          @click="handleClick"
          class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          :class="{ 'scale-0 rotate-180': !show, 'scale-100 rotate-0': show }"
        >
          <!-- Plus Icon -->
          <svg 
            class="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  to?: string
}>()

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()
const show = ref(false)

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    emit('click')
  }
}

onMounted(() => {
  // Delay animation for smooth entrance
  setTimeout(() => {
    show.value = true
  }, 300)
})
</script>
