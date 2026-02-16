// src/composables/useDarkMode.js
import { ref } from 'vue'
import { Dark } from 'quasar'

// Global state that persists across component instances
const isDarkMode = ref(false)

export function useDarkMode() {
  // Initialize dark mode from localStorage or system preference
  const initializeDarkMode = () => {
    const savedTheme = localStorage.getItem('securitea-theme')

    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      // Use system preference as default
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    Dark.set(isDarkMode.value)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    Dark.set(isDarkMode.value)
    localStorage.setItem('securitea-theme', isDarkMode.value ? 'dark' : 'light')
  }

  // Set dark mode explicitly
  const setDarkMode = (value) => {
    isDarkMode.value = value
    Dark.set(value)
    localStorage.setItem('securitea-theme', value ? 'dark' : 'light')
  }

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    initializeDarkMode,
  }
}
