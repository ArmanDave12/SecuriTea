import { db } from 'src/boot/firebase'
import { ref as vueRef } from 'vue'
import { ref as dbRefFunc, get, child, push, set } from 'firebase/database'
import { encryptPin, decryptPin } from 'src/composables/useCrypto'
import useNotify from 'src/composables/useNotify'
import { db as dexieDB } from 'src/boot/dexie'
import { firebaseConnected } from 'src/boot/firebaseConnection'

const useAuth = () => {
  const { success, error: notifyError } = useNotify()

  const user = vueRef(null)
  const error = vueRef('')
  const loading = vueRef(false)

  const login = async (nickname, pin) => {
    error.value = ''
    loading.value = true
    try {
      const dbRef = dbRefFunc(db)

      const foundUser = await dexieDB.users.where('nickname').equals(nickname).first()

      if (foundUser) {
        if (decryptPin(foundUser.pin) === pin && foundUser.nickname === nickname) {
          user.value = foundUser
          localStorage.setItem('loggedInUser', JSON.stringify(foundUser))
          success('Logged in successfully!')
          return foundUser
        } else if (decryptPin(foundUser.pin) !== pin) {
          notifyError('PIN is incorrect')
          return null
        } else if (foundUser.nickname !== nickname) {
          notifyError('Nickname is incorrect')
          return null
        }
      }

      notifyError('User not found')
      return null
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.message
      notifyError(err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('loggedInUser')
    success('Logged out successfully!')
  }

  const signup = async (nickname, pin) => {
    error.value = ''
    loading.value = true
    const encryptedPin = encryptPin(pin)
    const timestamp = Date.now()
    try {
      await dexieDB.users.add({
        id: `${nickname}-${timestamp}`,
        nickname,
        pin: encryptedPin,
        createdAt: timestamp,
        synced: false,
      })

      success('Account created successfully!')
      return { nickname, pin: encryptedPin }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('loggedInUser')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
      return user.value
    }
    return null
  }

  const getAllUsers = () => dexieDB.users.toArray()

  return { user, login, logout, signup, getCurrentUser, getAllUsers, error, loading }
}

export default useAuth
