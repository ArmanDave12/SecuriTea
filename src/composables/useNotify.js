import { Notify } from 'quasar'

export default function useNotify() {
  /**
   * Show a Quasar notification
   * @param {Object} options - Notification options
   * options example: { message: 'Hello', color: 'positive', icon: 'check' }
   */
  const show = (options) => {
    Notify.create({
      color: options.color || 'primary',
      position: options.position || 'top',
      timeout: options.timeout || 3000,
      message: options.message || '',
      icon: options.icon || '',
      actions: options.actions || [],
      ...options,
    })
  }

  const success = (message, timeout = 3000) => {
    show({ message, color: 'positive', icon: 'check', timeout })
  }

  const error = (message, timeout = 3000) => {
    show({ message, color: 'negative', icon: 'error', timeout })
  }

  const info = (message, timeout = 3000) => {
    show({ message, color: 'info', icon: 'info', timeout })
  }

  const warning = (message, timeout = 3000) => {
    show({ message, color: 'warning', icon: 'warning', timeout })
  }

  return { show, success, error, info, warning }
}
