<template>
  <div class="secret-container">
    <!-- Fixed Height Layout - No Scrolling -->
    <div class="main-layout">
      <!-- Top Section with Back Button -->
      <div class="top-section">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          size="sm"
          @click="goBack"
          class="back-btn"
        />
        <div class="status-dots">
          <div class="dot active"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- Center Hero Content -->
      <div class="hero-center">
        <div class="secret-icon">🔐</div>
        <div class="main-title">Secret Zone</div>
        <div class="subtitle">Developer Console Unlocked</div>
      </div>

      <!-- Bottom Action Section -->
      <div class="action-section">
        <div class="action-row">
          <div class="action-btn primary" @click="onSecretButtonClick">
            <q-icon
              :name="isSyncing ? 'sync' : 'cloud_sync'"
              size="20px"
              :class="{ rotating: isSyncing }"
            />
            <span>Sync Data</span>
          </div>
          <div class="action-btn" @click="showDebugInfo">
            <q-icon name="bug_report" size="20px" />
            <span>Debug</span>
          </div>
        </div>

        <div class="action-row">
          <div class="action-btn danger" @click="showClearData">
            <q-icon name="delete_sweep" size="20px" />
            <span>Clear All</span>
          </div>
          <div class="action-btn" @click="showSettings">
            <q-icon name="settings" size="20px" />
            <span>Settings</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome Popup - Centered -->
    <q-dialog v-model="welcomeDialog" persistent>
      <div class="welcome-popup">
        <div class="popup-icon">🎉</div>
        <div class="popup-title">Secret Unlocked!</div>
        <div class="popup-text">You found the developer panel</div>
        <q-btn
          color="primary"
          label="Continue"
          @click="closeWelcomeDialog"
          rounded
          no-caps
          class="continue-btn"
        />
      </div>
    </q-dialog>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-screen">
      <q-spinner-ios color="white" size="24px" />
      <div class="loading-text">Loading...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasswords } from 'src/composables/usePasswords'

const { syncFromFirebaseToDexie, removeCredentials } = usePasswords()
const $q = useQuasar()
const welcomeDialog = ref(false)
const isLoading = ref(true)
const isSyncing = ref(false)
const router = useRouter()

onMounted(async () => {
  console.log('Secret page mounted')

  setTimeout(async () => {
    isLoading.value = false
    await nextTick()

    setTimeout(() => {
      welcomeDialog.value = true
    }, 100)
  }, 600)
})

const closeWelcomeDialog = () => {
  welcomeDialog.value = false

  $q.notify({
    color: 'positive',
    position: 'top',
    message: 'Developer console activated! 🚀',
    timeout: 2000,
  })
}

const onSecretButtonClick = async () => {
  if (isSyncing.value) return

  isSyncing.value = true

  try {
    $q.notify({
      color: 'info',
      position: 'top',
      message: 'Syncing with Firebase...',
      timeout: 1000,
    })

    // await new Promise((resolve) => setTimeout(resolve, 2000))

    await syncFromFirebaseToDexie()
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Data synced successfully! ✅',
      timeout: 2500,
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Sync failed. Try again.',
      timeout: 2500,
    })
  } finally {
    isSyncing.value = false
  }
}

const showDebugInfo = () => {
  $q.notify({
    color: 'info',
    position: 'center',
    message: `Device: ${window.innerWidth}x${window.innerHeight}px`,
    timeout: 3000,
  })
}

const showClearData = () => {
  $q.dialog({
    title: 'Clear Data?',
    message: 'This will delete all passwords.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await removeCredentials()
    $q.notify({
      color: 'positive',
      message: 'Successfully cleared data.',
      position: 'top',
      timeout: 2000,
    })
  })
}

const showSettings = () => {
  $q.notify({
    color: 'info',
    message: 'Settings panel coming soon...',
    position: 'top',
    timeout: 2000,
  })
}

const goBack = async () => {
  try {
    await router.push('/main')
  } catch (error) {
    window.history.back()
  }
}
</script>

<style scoped>
.secret-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

/* Top Section - 15% */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 15%;
  min-height: 60px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 12px;
}

.status-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: #60a5fa;
  width: 18px;
  border-radius: 3px;
}

/* Hero Center - 50% */
.hero-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50%;
  text-align: center;
  color: white;
}

.secret-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #60a5fa, #3b82f6, #2563eb);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 200px;
}

/* Action Section - 35% */
.action-section {
  height: 35%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.action-row {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  text-align: center;
  min-height: 70px;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.primary {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.action-btn span {
  font-size: 12px;
  font-weight: 500;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Welcome Popup */
.welcome-popup {
  background: #1f2937;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  color: white;
  min-width: 260px;
  max-width: 90vw;
}

.popup-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.popup-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #60a5fa;
}

.popup-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
}

.continue-btn {
  min-width: 120px;
}

/* Loading Screen */
.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 12px;
}

/* Mobile Responsive */
@media (max-width: 360px) {
  .main-layout {
    padding: 12px;
  }

  .secret-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .main-title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 13px;
  }

  .action-btn {
    padding: 12px 8px;
    min-height: 64px;
  }

  .action-btn span {
    font-size: 11px;
  }

  .welcome-popup {
    padding: 24px 20px;
    min-width: 240px;
  }
}

@media (max-width: 320px) {
  .main-layout {
    padding: 10px;
  }

  .secret-icon {
    font-size: 36px;
  }

  .main-title {
    font-size: 24px;
  }

  .action-section {
    gap: 10px;
  }

  .action-row {
    gap: 10px;
  }

  .action-btn {
    padding: 10px 6px;
    min-height: 60px;
  }
}

/* Landscape adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .hero-center {
    height: 40%;
  }

  .action-section {
    height: 40%;
  }

  .secret-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .main-title {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .action-btn {
    min-height: 56px;
    padding: 12px 8px;
  }
}
</style>
