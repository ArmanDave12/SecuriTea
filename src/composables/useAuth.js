import { db } from 'src/boot/firebase'
import { ref as vueRef } from 'vue'
import { ref as dbRefFunc, get, child, push, set, update } from 'firebase/database'
import { encryptPin, decryptPin } from 'src/composables/useCrypto'
import useNotify from 'src/composables/useNotify'
import { db as dexieDB } from 'src/boot/dexie'

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

  const getAllUsers = () => dexieDB.users.toArray()

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('loggedInUser')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
      return user.value
    }
    notifyError('No user logged in')
    return null
  }

  const updateCurrentUser = async (data) => {
    const currentUser = getCurrentUser()
    try {
      if (data.pin && data.newPin) {
        const currentPin = decryptPin(currentUser.pin)
        if (currentPin === data.pin) {
          const encryptedNewPin = encryptPin(data.newPin)
          const updateData = {
            pin: encryptedNewPin,
            synced: false,
          }

          const modifiedCount = await dexieDB.users
            .where('id')
            .equals(currentUser.id)
            .modify((u) => {
              Object.assign(u, updateData)
            })

          const updatedUser = {
            ...currentUser,
            pin: encryptedNewPin,
            newPin: undefined,
          }
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser))
          success('PIN updated successfully!')
          return modifiedCount
        } else {
          notifyError('Current PIN is incorrect')
          return null
        }
      } else {
        if (data.name) {
          const updateData = {
            nickname: data.name,
            id: `${data.name}-${currentUser.createdAt}`,
            originalId: currentUser.id, // Track the original ID
            synced: false,
          }
          const modifiedCount = await dexieDB.users
            .where('id')
            .equals(currentUser.id)
            .modify((u) => {
              Object.assign(u, updateData)
            })
          const updatedUser = {
            ...currentUser,
            nickname: updateData.nickname,
            id: updateData.id, // Update the ID in localStorage too
            newPin: undefined,
          }
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser))
          success('Name updated successfully!')
          return modifiedCount
        } else {
          const updateData = {
            fingerprint: data.fingerprint,
            synced: false,
          }
          const modifiedCount = await dexieDB.users
            .where('id')
            .equals(currentUser.id)
            .modify((u) => {
              Object.assign(u, updateData)
            })
          const updatedUser = {
            ...currentUser,
            fingerprint: updateData.fingerprint,
            newPin: undefined,
          }
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser))
          success('Fingerprint setting updated successfully!')
          return modifiedCount
        }
        // const modifiedCount = await dexieDB.users
        //   .where('id')
        //   .equals(currentUser.id)
        //   .modify((u) => {
        //     Object.assign(u, data)
        //   })
      }
      // } else {
      //   // Handle regular updates (profile name, profile image, etc.)
      //   const modifiedCount = await dexieDB.users
      //     .where('id')
      //     .equals(currentUser.id)
      //     .modify((u) => {
      //       Object.assign(u, data)
      //     })

      //   // Update localStorage to keep in sync
      //   const updatedUser = { ...currentUser, ...data }
      //   user.value = updatedUser
      //   localStorage.setItem('loggedInUser', JSON.stringify(updatedUser))

      //   return modifiedCount
      // }
    } catch (err) {
      console.error('Error updating current user:', err)
      notifyError('Failed to update user information')
      return 0
    }
  }

  return {
    user,
    login,
    logout,
    signup,
    getCurrentUser,
    getAllUsers,
    updateCurrentUser,
    error,
    loading,
  }
}

export default useAuth
