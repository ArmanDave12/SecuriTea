// src/boot/firebaseConnection.js
import { boot } from 'quasar/wrappers'
import { ref } from 'vue'
import { getDatabase, ref as dbRef, onValue } from 'firebase/database'

export const firebaseConnected = ref(false)

export default boot(() => {
  setupFirebaseConnectionListener()
})

function setupFirebaseConnectionListener() {
  const db = getDatabase()
  const connectedRef = dbRef(db, '.info/connected')

  onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val() === true

    firebaseConnected.value = isConnected

    if (isConnected) {
      console.log('[Heartbeat] Firebase Connected')
    } else {
      console.log('[Heartbeat] Firebase Disconnected')
    }
  })
}
