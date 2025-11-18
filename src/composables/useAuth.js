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
    let foundUser = null
    try {
      const dbRef = dbRefFunc(db)

      console.log('firebaseConnected', firebaseConnected.value)
      if (firebaseConnected.value) {
        const snapshot = await get(child(dbRef, 'users'))
        if (snapshot.exists()) {
          const users = snapshot.val()
          foundUser = Object.values(users).find((u) => u.nickname === nickname)
        }
      }
      if (foundUser === null) {
        foundUser = await dexieDB.users.where('nickname').equals(nickname).first()
      }

      if (foundUser && decryptPin(foundUser.pin) === pin) {
        user.value = foundUser
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser))
        success('Logged in successfully!')
        return foundUser
      }

      notifyError('Nickname or PIN is incorrect')
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
      if (firebaseConnected.value) {
        const usersRef = dbRefFunc(db, 'users')
        const newUserRef = push(usersRef)
        await set(newUserRef, { nickname, pin: encryptedPin, createdAt: timestamp })
        await dexieDB.users.add({
          nickname,
          pin: encryptedPin,
          createdAt: timestamp,
          synced: true,
        })
      } else {
        await dexieDB.users.add({
          nickname,
          pin: encryptedPin,
          createdAt: timestamp,
          synced: false,
        })
      }

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

  return { user, login, logout, signup, getCurrentUser, error, loading }
}

export default useAuth
