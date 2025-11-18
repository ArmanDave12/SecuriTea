<script setup>
import { onUnmounted } from 'vue'
import { liveQuery } from 'dexie'
import { db as dexieDB } from 'src/boot/dexie'
import { useSync } from './composables/useSync'

const { syncPass, syncUsers } = useSync()

// Watch unsynced credentials
const credentialsSubscription = liveQuery(() =>
  dexieDB.credentials.filter((c) => c.synced === false).toArray(),
).subscribe((unsyncedCreds) => {
  if (unsyncedCreds.length) {
    syncPass().catch((err) => console.error('[Sync] syncPass failed', err))
  }
})

// Watch unsynced users
const usersSubscription = liveQuery(() =>
  dexieDB.users.filter((u) => u.synced === false).toArray(),
).subscribe((unsyncedUsers) => {
  if (unsyncedUsers.length) {
    syncUsers().catch((err) => console.error('[Sync] syncUsers failed', err))
  }
})

// Clean up subscriptions on unmount
onUnmounted(() => {
  credentialsSubscription.unsubscribe()
  usersSubscription.unsubscribe()
})
</script>

<template>
  <router-view />
</template>
