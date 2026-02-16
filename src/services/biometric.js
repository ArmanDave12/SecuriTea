// src/services/biometric.js
import { NativeBiometric } from 'capacitor-native-biometric'
import useAuth from 'src/composables/useAuth'
import useNotify from 'src/composables/useNotify'

export class BiometricService {
  constructor() {
    this.auth = useAuth()
    this.notify = useNotify()
  }

  async isAvailable() {
    try {
      if (!window.Capacitor) {
        console.log('Capacitor not available - running in browser')
        return false
      }

      const result = await NativeBiometric.isAvailable()
      return result.isAvailable
    } catch (error) {
      console.error('Biometric availability check failed:', error)
      return false
    }
  }

  async isBiometricEnabled() {
    const user = this.auth.getCurrentUser()
    return user?.fingerprint === true
  }

  async enableBiometric() {
    try {
      const isAvailable = await this.isAvailable()
      if (!isAvailable) {
        this.notify.error('Biometric authentication is not available on this device')
        return false
      }

      // Test biometric authentication first
      const authResult = await this.authenticate('Enable biometric login for SecuriTea')
      if (!authResult) {
        return false
      }

      // Store user credentials for biometric login
      const user = this.auth.getCurrentUser()
      if (user) {
        await NativeBiometric.setCredentials({
          username: user.nickname,
          password: user.id, // Use user ID as identifier
          server: 'securitea-app',
        })

        // Update user preference in database
        await this.auth.updateCurrentUser({ fingerprint: true })
        this.notify.success('Biometric authentication enabled!')
        return true
      }

      return false
    } catch (error) {
      console.error('Error enabling biometric:', error)
      this.notify.error('Failed to enable biometric authentication')
      return false
    }
  }

  async disableBiometric() {
    try {
      // Remove stored credentials
      await NativeBiometric.deleteCredentials({
        server: 'securitea-app',
      })

      // Update user preference in database
      await this.auth.updateCurrentUser({ fingerprint: false })
      this.notify.success('Biometric authentication disabled!')
      return true
    } catch (error) {
      console.error('Error disabling biometric:', error)
      this.notify.error('Failed to disable biometric authentication')
      return false
    }
  }

  async authenticate(reason = 'Please verify your identity') {
    try {
      const result = await NativeBiometric.verifyIdentity({
        reason,
        title: 'Biometric Authentication',
        subtitle: 'Use your biometric to authenticate',
        description: 'Place your finger on the sensor or look at the camera',
        fallbackTitle: 'Use PIN instead',
        maxAttempts: 3,
      })

      return result.verified || result.success || true
    } catch (error) {
      console.error('Biometric authentication failed:', error)

      // Handle specific error cases
      if (error.message?.includes('User canceled') || error.code === 'UserCancel') {
        // User canceled, don't show error
        return false
      } else if (error.message?.includes('Too many attempts') || error.code === 'TooManyAttempts') {
        this.notify.error('Too many failed attempts. Please try again later.')
        return false
      } else {
        this.notify.error('Biometric authentication failed')
        return false
      }
    }
  }

  async loginWithBiometric() {
    try {
      const isEnabled = await this.isBiometricEnabled()
      if (!isEnabled) {
        this.notify.error('Biometric authentication is not enabled')
        return null
      }

      // Authenticate first
      const authSuccess = await this.authenticate('Login to SecuriTea')
      if (!authSuccess) {
        return null
      }

      // Get stored credentials
      const credentials = await NativeBiometric.getCredentials({
        server: 'securitea-app',
      })

      if (credentials && credentials.username && credentials.password) {
        // Find user by stored credentials
        const { getAllUsers } = this.auth
        const users = await getAllUsers()
        const user = users.find(
          (u) => u.nickname === credentials.username && u.id === credentials.password,
        )

        if (user) {
          // Set as current user
          localStorage.setItem('loggedInUser', JSON.stringify(user))
          this.notify.success('Biometric login successful!')
          return user
        }
      }

      this.notify.error('Biometric credentials not found')
      return null
    } catch (error) {
      console.error('Biometric login failed:', error)
      this.notify.error('Biometric login failed')
      return null
    }
  }

  async getBiometricType() {
    try {
      const result = await NativeBiometric.isAvailable()
      return result.biometryType || 'biometric'
    } catch (error) {
      return 'biometric'
    }
  }
}

export default BiometricService
