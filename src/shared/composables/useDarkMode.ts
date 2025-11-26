import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  // Initialize from localStorage or system preference
  const initDarkMode = () => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      isDark.value = stored === 'true'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateHtmlClass()
  }

  // Update HTML class
  const updateHtmlClass = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle dark mode
  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value.toString())
    updateHtmlClass()
  }

  // Watch for changes
  watch(isDark, () => {
    updateHtmlClass()
  })

  // Initialize on mount
  onMounted(() => {
    initDarkMode()
  })

  return {
    isDark,
    toggle,
  }
}
