// src/boot/darkMode.js
import { boot } from 'quasar/wrappers'
import { Dark } from 'quasar'

export default boot(() => {
  // Get saved theme preference
  const savedTheme = localStorage.getItem('securitea-theme')

  let isDark = false

  if (savedTheme) {
    // Use saved preference
    isDark = savedTheme === 'dark'
  } else {
    // Use system preference as default
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Apply the theme
  Dark.set(isDark)
})
