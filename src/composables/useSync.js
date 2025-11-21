// src/composables/useSync.js
import { watch } from 'vue'
import { ref, set, push, update, remove } from 'firebase/database'
import { db as dexieDB } from 'src/boot/dexie'
import { firebaseConnected } from 'src/boot/firebaseConnection'
import { db as realtimeDB } from 'src/boot/firebase'

export function useSync() {
  //   const realtimeDB = getDatabase()

  // watch Firebase connection
  watch(
    () => firebaseConnected.value,
    (isConnected) => {
      if (isConnected) {
        syncUsers().catch((err) => console.error('[Sync] syncUsers failed', err))
        syncPass().catch((err) => console.error('[Sync] syncPass failed', err))
      }
    },
  )

  /**
   * 🧾 Sync local users to Firebase
   */
  async function syncUsers() {
    try {
      const unsyncedUsers = await dexieDB.users.filter((user) => user.synced === false).toArray()
      if (!unsyncedUsers.length) {
        console.log('[Sync] No unsynced users found')
        return
      }
      console.log(`[Sync] Found ${unsyncedUsers.length} local users to sync`)

      for (const user of unsyncedUsers) {
        try {
          // Check if user has an original ID (meaning name was changed)
          if (user.originalId && user.originalId !== user.id) {
            // Delete the old Firebase entry
            const oldUserRef = ref(realtimeDB, `users/${user.originalId}`)
            await remove(oldUserRef)
            console.log(`[Sync] Removed old user entry: ${user.originalId}`)
          }

          // Create/update the new Firebase entry
          const newUserRef = ref(realtimeDB, `users/${user.id}`)
          await set(newUserRef, {
            id: user.id,
            nickname: user.nickname,
            pin: user.pin,
            createdAt: user.createdAt,
            profileImage: user.profileImage,
          })

          // Mark as synced and remove originalId
          await dexieDB.users.where('id').equals(user.id).modify({
            synced: true,
            originalId: undefined, // Clean up the tracking field
          })

          console.log(`[Sync] Synced user: ${user.nickname} with ID: ${user.id}`)
        } catch (err) {
          console.error('[Sync] Failed to sync user:', user.nickname, err)
        }
      }
    } catch (err) {
      console.error('[Sync] Failed to get unsynced users:', err)
      return
    }
  }

  async function syncPass() {
    try {
      const unsynced = await dexieDB.credentials.filter((creds) => creds.synced === false).toArray()
      if (!unsynced.length) return
      console.log(`[Sync] Found ${unsynced.length} unsynced credentials`)

      for (const cred of unsynced) {
        try {
          await dexieDB.credentials.update(cred.id, { synced: 'syncing' })

          const credRef = ref(realtimeDB, `credentials/${cred.userId}`)

          if (cred.syncAction === 'update' && cred.firebaseKey) {
            // Update existing Firebase record
            await update(ref(realtimeDB, `credentials/${cred.userId}/${cred.firebaseKey}`), {
              email: cred.email || '',
              platform: cred.platform || '',
              password: cred.password || '',
              username: cred.username || '',
              updatedAt: Date.now(),
            })
            console.log(`[Sync] Updated Firebase record ${cred.firebaseKey}`)
          } else {
            const newCredRef = push(credRef)
            await set(newCredRef, {
              userId: cred.userId || 'unknown',
              email: cred.email || '',
              platform: cred.platform || '',
              password: cred.password || '',
              username: cred.username || '',
              createdAt: cred.createdAt || Date.now(),
            })

            // Store the Firebase key for future updates
            await dexieDB.credentials.update(cred.id, {
              firebaseKey: newCredRef.key,
              synced: true,
            })
            console.log(`[Sync] Created Firebase record ${newCredRef.key}`)
            continue // Skip the next update since we already updated
          }

          await dexieDB.credentials.update(cred.id, { synced: true })
          console.log(`[Sync] Synced credential ${cred.id}`)
        } catch (err) {
          await dexieDB.credentials.update(cred.id, { synced: false })
          console.error(`[Sync] Failed to sync credential ${cred.id}:`, err)
        }
      }
    } catch (err) {
      console.error('[Sync] Failed to fetch unsynced credentials:', err)
    }
  }

  return { syncUsers, syncPass }
}
