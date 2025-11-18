// src/composables/usePasswords.js
import { ref, watch } from 'vue'
import { db as dexieDB } from 'src/boot/dexie'
import { db as realtimeDB } from 'src/boot/firebase'
import { ref as dbRefFunc, push, set, get } from 'firebase/database'
import { encryptPin, decryptPin } from './useCrypto'
import useAuth from './useAuth'
import useNotify from './useNotify'
import { firebaseConnected } from 'src/boot/firebaseConnection'

export function usePasswords() {
  const loading = ref(false)
  const error = ref('')
  const { getCurrentUser } = useAuth()
  const { success, error: notifyError } = useNotify()

  // Fix 1: Get the proper properties from the currentUser object
  const currentUser = getCurrentUser() || {}
  const userId = currentUser.nickname || 'anonymous' // Use nickname as userId
  const username = currentUser.nickname // Use nickname as username too

  /**
   * Add credential locally and optionally sync to Firebase
   */
  const addCredential = async (email, password, title) => {
    loading.value = true
    error.value = ''
    const createdAt = Date.now()
    const encryptedPassword = encryptPin(password)

    try {
      console.log('[Add Credential] Firebase connected:', firebaseConnected.value) // Debug log

      await dexieDB.credentials.add({
        userId,
        email,
        password: encryptedPassword,
        title,
        createdAt,
        synced: false,
      })

      success('Credential added successfully!')
      return { email, password, createdAt }
    } catch (err) {
      console.error('[Add Credential] Error:', err)
      error.value = err.message
      notifyError(`Failed to add credential: ${err.message}`)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all credentials for current user, decrypted
   */
  const getCredentials = async () => {
    loading.value = true
    try {
      const creds = await dexieDB.credentials.filter((u) => u.userId === userId).toArray()
      return creds.map((c) => ({
        ...c,
        password: decryptPin(c.password),
      }))
    } catch (err) {
      console.error('[Get Credentials] Error:', err)
      notifyError(`Failed to load credentials: ${err.message}`)
      return []
    } finally {
      loading.value = false
    }
  }

  const getCredsInFirebase = async () => {
    try {
      const userRef = dbRefFunc(realtimeDB, `credentials/${userId}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) return []

      const data = snapshot.val()

      return Object.keys(data).map((key) => ({
        id: key, // Firebase record ID
        userId: data[key].userId,
        email: data[key].email,
        password: decryptPin(data[key].password),
        title: data[key].title,
        createdAt: data[key].createdAt,
      }))
    } catch (err) {
      console.error('[getCredsInFirebase] Error:', err)
      return []
    }
  }

  const syncFromFirebaseToDexie = async () => {
    const firebaseCreds = await getCredsInFirebase()

    for (const cred of firebaseCreds) {
      const exists = await dexieDB.credentials.where({ createdAt: cred.createdAt }).first()

      if (!exists) {
        await dexieDB.credentials.add({
          userId: cred.userId,
          email: cred.email,
          password: encryptPin(cred.password),
          title: cred.title,
          createdAt: cred.createdAt,
          synced: true,
        })
      }
    }
  }

  const removeCredentials = async () => {
    loading.value = true
    error.value = ''
    try {
      await dexieDB.credentials.clear()
      return true
    } catch (err) {
      console.error('[Remove Credential] Error:', err)
      error.value = err.message
      notifyError(`Failed to remove credential: ${err.message}`)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    addCredential,
    getCredentials,
    getCredsInFirebase,
    syncFromFirebaseToDexie,
    removeCredentials,
    loading,
    error,
  }
}
