// src/utils/notify.js
import { useQuasar } from 'quasar'

export function useNotify() {
  // Move useQuasar() call inside the returned function
  // This ensures it's called within a component context
  const getQuasarInstance = () => {
    try {
      return useQuasar()
    } catch (error) {
      console.warn('useQuasar() called outside of component context:', error)
      return null
    }
  }

  // Generic notify
  function notify(message, options = {}) {
    const $q = getQuasarInstance()
    if (!$q) {
      console.warn('Quasar instance not available, falling back to console.log')
      console.log(message)
      return
    }

    $q.notify({
      message: message || '',
      color: options.color || 'primary',
      icon: options.icon || '',
      position: options.position || 'top',
      timeout: options.timeout || 3000,
      spinner: options.spinner || false,
      actions: options.actions || [],
      ...options,
    })
  }

  // Predefined types
  function success(message, timeout = 3000) {
    notify(message, { color: 'positive', icon: 'check', timeout })
  }

  function error(message, timeout = 3000) {
    notify(message, { color: 'negative', icon: 'error', timeout })
  }

  function info(message, timeout = 3000) {
    notify(message, { color: 'info', icon: 'info', timeout })
  }

  function warning(message, timeout = 3000) {
    notify(message, { color: 'warning', icon: 'warning', timeout })
  }

  // Special shortcut for "still building" notifications
  function building(message = '🚧 This feature is still under construction!', timeout = 2500) {
    notify(message, { color: 'orange', icon: 'construction', timeout })
  }

  return { notify, success, error, info, warning, building }
}

// Alternative approach: Create a singleton pattern
let quasarInstance = null

export function initializeNotify() {
  try {
    quasarInstance = useQuasar()
  } catch (error) {
    console.warn('Failed to initialize Quasar notify utility:', error)
  }
}

// Direct notification functions that can be imported individually
export function quickNotify(message, options = {}) {
  if (!quasarInstance) {
    console.warn('Quasar not initialized. Call initializeNotify() first.')
    console.log(message)
    return
  }

  quasarInstance.notify({
    message: message || '',
    color: options.color || 'primary',
    icon: options.icon || '',
    position: options.position || 'top',
    timeout: options.timeout || 3000,
    ...options,
  })
}

export function quickSuccess(message, timeout = 3000) {
  quickNotify(message, { color: 'positive', icon: 'check', timeout })
}

export function quickError(message, timeout = 3000) {
  quickNotify(message, { color: 'negative', icon: 'error', timeout })
}

export function quickBuilding(
  message = '🚧 This feature is still under construction!',
  timeout = 2500,
) {
  quickNotify(message, { color: 'orange', icon: 'construction', timeout })
}
