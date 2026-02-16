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
  const userId = `${currentUser.nickname}-${currentUser.createdAt}`
  const username = currentUser.nickname // Use nickname as username too

  /**
   * Add credential locally and optionally sync to Firebase
   */
  const addCredential = async (email, password, username, platform) => {
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
        username,
        platform,
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
      console.log('[Get Credentials] Found', creds.length, 'credentials')
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

  const getCredsInFirebase = async (getAllCredentials = false) => {
    try {
      // If getAllCredentials is true, get all credentials from the root
      const userRef = getAllCredentials
        ? dbRefFunc(realtimeDB, 'credentials')
        : dbRefFunc(realtimeDB, `credentials/${userId}`)

      const snapshot = await get(userRef)

      if (!snapshot.exists()) return []

      const data = snapshot.val()

      if (getAllCredentials) {
        // When getting all credentials, we need to iterate through all users
        const allCredentials = []

        Object.keys(data).forEach((userKey) => {
          const userCredentials = data[userKey]
          Object.keys(userCredentials).forEach((credKey) => {
            allCredentials.push({
              id: credKey,
              userId: userCredentials[credKey].userId,
              email: userCredentials[credKey].email,
              password: decryptPin(userCredentials[credKey].password),
              username: userCredentials[credKey].username,
              createdAt: userCredentials[credKey].createdAt,
              platform: userCredentials[credKey].platform,
            })
          })
        })

        return allCredentials
      } else {
        // Original logic for specific user
        return Object.keys(data).map((key) => ({
          id: key,
          userId: data[key].userId,
          email: data[key].email,
          password: decryptPin(data[key].password),
          username: data[key].username,
          createdAt: data[key].createdAt,
          platform: data[key].platform,
        }))
      }
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
          userId: `${cred.userId}`,
          email: cred.email,
          password: encryptPin(cred.password),
          username: cred.username,
          platform: cred.platform,
          createdAt: cred.createdAt,
          firebaseKey: cred.id, // Store Firebase key
          synced: true,
        })
      }
    }
  }

  /**
   * Remove all credentials for current user
   */
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

  const removeCredential = async (id) => {
    loading.value = true
    error.value = ''
    try {
      await dexieDB.credentials.delete(id)
      success('Credential removed successfully!')
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

  const editCred = async (id, email, password, username, platform) => {
    loading.value = true
    error.value = ''
    try {
      await dexieDB.credentials.update(id, {
        email,
        password: encryptPin(password),
        username,
        platform,
        synced: false,
        syncAction: 'update', // New field to track what action is needed
      })
      success('Credential edited successfully!')
      return true
    } catch (err) {
      console.error('[Edit Credential] Error:', err)
      error.value = err.message
      notifyError(`Failed to edit credential: ${err.message}`)
      return false
    } finally {
      loading.value = false
    }
  }

  const loadUserCredentials = async (input) => {
    try {
      // Get all credentials from Firebase
      const allCredentials = await getCredsInFirebase(true)

      if (!allCredentials || allCredentials.length === 0) {
        throw new Error('No credentials found in Firebase')
      }

      // Filter credentials by userId or nickname
      const userCredentials = allCredentials.filter((cred) => {
        if (cred.userId === input) {
          return true
        }

        const userIdParts = cred.userId?.split('-')
        if (userIdParts && userIdParts.length >= 2) {
          const nicknameFromUserId = userIdParts[0]
          return nicknameFromUserId.toLowerCase() === input.toLowerCase()
        }

        return false
      })

      if (userCredentials.length === 0) {
        throw new Error(`No credentials found for "${input}"`)
      }

      // Get the userId of the first credential
      const targetUserId = userCredentials[0].userId

      // Switch to this user's auth context
      const { switchUser } = useAuth()
      await switchUser(targetUserId)

      // Clear existing credentials
      await dexieDB.credentials.clear()

      // Save each credential to IndexedDB
      for (const credential of userCredentials) {
        await dexieDB.credentials.add({
          userId: credential.userId,
          email: credential.email,
          password: encryptPin(credential.password),
          username: credential.username,
          createdAt: credential.createdAt,
          platform: credential.platform,
          firebaseKey: credential.id,
          synced: true,
        })
      }

      return {
        success: true,
        count: userCredentials.length,
        credentials: userCredentials,
        user: targetUserId,
      }
    } catch (error) {
      console.error('[loadUserCredentials] Error:', error)
      throw error
    }
  }

  const getAllCreds = async () => {
    const creds = await dexieDB.credentials.toArray()
    return creds.map((c) => ({
      ...c,
      password: decryptPin(c.password),
    }))
  }

  return {
    addCredential,
    getCredentials,
    getCredsInFirebase,
    syncFromFirebaseToDexie,
    removeCredentials,
    removeCredential,
    editCred,
    loadUserCredentials,
    loading,
    error,
  }
}
