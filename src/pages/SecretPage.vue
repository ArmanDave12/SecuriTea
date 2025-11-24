<template>
  <div class="secret-container">
    <!-- Fixed Height Layout - No Scrolling -->
    <div class="main-layout">
      <!-- Top Section with Back Button -->
      <div class="top-section q-mt-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          size="sm"
          @click="goBack"
          class="back-btn q-mt-md"
        />
        <div class="status-dots q-mt-md">
          <div class="dot active"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- Center Monitor Content -->
      <div class="monitor-center">
        <CredentialsMonitor :get-all-credentials="true" ref="monitorRef" />
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-value">{{ totalRecords }}</div>
              <div class="stat-label">Total Records</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ uniqueUsers }}</div>
              <div class="stat-label">Unique Users</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🌐</div>
            <div class="stat-info">
              <div class="stat-value">{{ uniquePlatforms }}</div>
              <div class="stat-label">Platforms</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🔄</div>
            <div class="stat-info">
              <div class="stat-value">{{ connectionStatus }}</div>
              <div class="stat-label">Status</div>
            </div>
          </div>
        </div>
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
          <div class="action-btn" @click="showDecryptDialog">
            <q-icon name="lock_open" size="20px" />
            <span>Decrypt</span>
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

    <!-- PIN Entry Dialog - Must appear before welcome -->
    <q-dialog v-model="pinDialog" persistent no-escape-dismiss>
      <div class="pin-popup">
        <div class="popup-icon">🔐</div>
        <div class="popup-title">Enter PIN</div>
        <div class="popup-text">Enter your 4-digit PIN to access the developer console</div>

        <!-- PIN Input Display -->
        <div class="pin-display q-mb-md">
          <div
            v-for="i in 4"
            :key="i"
            class="pin-dot"
            :class="{ filled: pinInput.length >= i, shake: pinError }"
          ></div>
        </div>

        <!-- Custom PIN Keypad -->
        <div class="pin-keypad">
          <div class="keypad-row">
            <button
              v-for="num in [1, 2, 3]"
              :key="num"
              class="keypad-btn"
              @click="addPinDigit(num)"
              :disabled="pinInput.length >= 4"
            >
              {{ num }}
            </button>
          </div>
          <div class="keypad-row">
            <button
              v-for="num in [4, 5, 6]"
              :key="num"
              class="keypad-btn"
              @click="addPinDigit(num)"
              :disabled="pinInput.length >= 4"
            >
              {{ num }}
            </button>
          </div>
          <div class="keypad-row">
            <button
              v-for="num in [7, 8, 9]"
              :key="num"
              class="keypad-btn"
              @click="addPinDigit(num)"
              :disabled="pinInput.length >= 4"
            >
              {{ num }}
            </button>
          </div>
          <div class="keypad-row">
            <button
              class="keypad-btn secondary"
              @click="clearPin"
              :disabled="pinInput.length === 0"
            >
              ←
            </button>
            <button class="keypad-btn" @click="addPinDigit(0)" :disabled="pinInput.length >= 4">
              0
            </button>
            <button class="keypad-btn primary" @click="verifyPin" :disabled="pinInput.length !== 4">
              ✓
            </button>
          </div>
        </div>

        <div v-if="pinError" class="pin-error q-mt-md">
          {{ pinErrorMessage }}
        </div>

        <!-- Back button to exit -->
        <q-btn
          flat
          color="grey-5"
          label="Back"
          @click="goBack"
          rounded
          no-caps
          class="back-btn-pin q-mt-md"
          size="sm"
        />
      </div>
    </q-dialog>

    <!-- Welcome Popup - Centered -->
    <q-dialog v-model="welcomeDialog" persistent>
      <div class="welcome-popup">
        <div class="popup-icon">🎉</div>
        <div class="popup-title">Developer Console Active!</div>
        <div class="popup-text">Database monitor initialized</div>
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

    <!-- Decrypt Dialog -->
    <q-dialog v-model="decryptDialog" persistent>
      <div class="decrypt-popup">
        <div class="popup-icon">🔓</div>
        <div class="popup-title">Decrypt Password</div>
        <div class="popup-text">Enter your secret key and encrypted data</div>

        <q-input
          v-model="secretKey"
          placeholder="Enter your secret key..."
          :type="showSecretKey ? 'text' : 'password'"
          outlined
          dark
          color="blue-4"
          class="decrypt-input q-mb-sm"
          :error="hasSecretKeyError"
          :error-message="secretKeyErrorMessage"
          label="Secret Key"
        >
          <template v-slot:append>
            <q-icon
              :name="showSecretKey ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showSecretKey = !showSecretKey"
            />
          </template>
        </q-input>

        <q-input
          v-model="encryptedKey"
          placeholder="Paste encrypted data here..."
          type="textarea"
          rows="3"
          outlined
          dark
          color="blue-4"
          class="decrypt-input q-mb-md"
          :error="hasEncryptedKeyError"
          :error-message="encryptedKeyErrorMessage"
          label="Encrypted Data"
        />

        <div v-if="decryptedPassword" class="decrypted-result q-mb-md">
          <div class="result-label">Decrypted Password:</div>
          <div class="result-value">{{ decryptedPassword }}</div>
          <q-btn
            flat
            round
            icon="content_copy"
            color="blue-4"
            size="sm"
            @click="copyToClipboard"
            class="copy-btn"
          />
        </div>

        <div class="decrypt-actions">
          <q-btn
            color="grey-7"
            label="Cancel"
            @click="closeDecryptDialog"
            rounded
            no-caps
            class="action-btn-dialog"
          />
          <q-btn
            color="primary"
            label="Decrypt"
            @click="performDecrypt"
            rounded
            no-caps
            class="action-btn-dialog"
            :loading="isDecrypting"
          />
        </div>
      </div>
    </q-dialog>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-screen">
      <q-spinner-ios color="white" size="24px" />
      <div class="loading-text">Initializing Developer Console...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasswords } from 'src/composables/usePasswords'
import CryptoJS from 'crypto-js'
import CredentialsMonitor from 'src/components/CredentialsMonitor.vue'

const { syncFromFirebaseToDexie, removeCredentials, getCredsInFirebase } = usePasswords()
const $q = useQuasar()

// PIN Security
const pinDialog = ref(true) // Show PIN dialog first
const pinInput = ref('')
const pinError = ref(false)
const pinErrorMessage = ref('')
const correctPin = ref('1234') // You can change this or make it configurable
const maxPinAttempts = ref(3)
const pinAttempts = ref(0)

// Existing states
const welcomeDialog = ref(false)
const decryptDialog = ref(false)
const isLoading = ref(true)
const isSyncing = ref(false)
const isDecrypting = ref(false)
const secretKey = ref('')
const encryptedKey = ref('')
const decryptedPassword = ref('')
const showSecretKey = ref(false)
const hasSecretKeyError = ref(false)
const secretKeyErrorMessage = ref('')
const hasEncryptedKeyError = ref(false)
const encryptedKeyErrorMessage = ref('')
const router = useRouter()

// Stats data
const monitorRef = ref(null)
const totalRecords = ref(0)
const uniqueUsers = ref(0)
const uniquePlatforms = ref(0)
const connectionStatus = ref('OFFLINE')

// Computed stats
const updateStats = async () => {
  try {
    const credentials = await getCredsInFirebase(true)
    totalRecords.value = credentials?.length || 0

    if (credentials && credentials.length > 0) {
      const users = new Set(credentials.map((c) => c.userId).filter((u) => u))
      uniqueUsers.value = users.size

      const platforms = new Set(credentials.map((c) => c.platform).filter((p) => p))
      uniquePlatforms.value = platforms.size

      connectionStatus.value = 'ONLINE'
    } else {
      uniqueUsers.value = 0
      uniquePlatforms.value = 0
      connectionStatus.value = credentials === null ? 'ERROR' : 'EMPTY'
    }
  } catch (error) {
    connectionStatus.value = 'ERROR'
    totalRecords.value = 0
    uniqueUsers.value = 0
    uniquePlatforms.value = 0
  }
}

// PIN Functions
const addPinDigit = (digit) => {
  if (pinInput.value.length < 4) {
    pinInput.value += digit.toString()

    // Auto-verify when 4 digits entered
    if (pinInput.value.length === 4) {
      setTimeout(() => {
        verifyPin()
      }, 200)
    }
  }
}

const clearPin = () => {
  pinInput.value = pinInput.value.slice(0, -1)
  pinError.value = false
  pinErrorMessage.value = ''
}

const verifyPin = () => {
  if (pinInput.value === correctPin.value) {
    // PIN is correct
    pinDialog.value = false
    pinError.value = false
    pinErrorMessage.value = ''

    // Start the normal loading sequence
    setTimeout(() => {
      isLoading.value = false
      setTimeout(() => {
        welcomeDialog.value = true
      }, 100)
    }, 300)
  } else {
    // PIN is incorrect
    pinAttempts.value++
    pinError.value = true

    if (pinAttempts.value >= maxPinAttempts.value) {
      pinErrorMessage.value = `Too many attempts. Access denied.`

      // Auto-exit after too many attempts
      setTimeout(() => {
        goBack()
      }, 2000)
    } else {
      const remaining = maxPinAttempts.value - pinAttempts.value
      pinErrorMessage.value = `Incorrect PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
    }

    // Clear the input after error
    setTimeout(() => {
      pinInput.value = ''

      // Remove shake animation after delay
      setTimeout(() => {
        pinError.value = false
        pinErrorMessage.value = ''
      }, 2000)
    }, 500)
  }
}

// Dynamic decrypt function using user-provided secret key
const decryptWithCustomKey = (encryptedData, customSecretKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, customSecretKey)
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8)
    if (!decryptedText) {
      throw new Error('Invalid secret key or corrupted data')
    }
    return decryptedText
  } catch (error) {
    throw new Error('Decryption failed: Invalid secret key or corrupted data')
  }
}

onMounted(async () => {
  console.log('Secret page mounted - PIN required first')

  // Don't start loading sequence until PIN is verified
  // The verifyPin function will handle the loading sequence
})

const closeWelcomeDialog = () => {
  welcomeDialog.value = false

  // Update stats when console activates
  updateStats()

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
      spinner: true,
      color: 'info',
      message: 'Syncing with Firebase...',
      timeout: 1000,
      position: 'top',
    })

    await syncFromFirebaseToDexie()
    setTimeout(() => {
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Data synced successfully! ✅',
        timeout: 2500,
      })
    }, 2000)
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

const showDecryptDialog = () => {
  decryptDialog.value = true
  // Reset state when opening dialog
  secretKey.value = ''
  encryptedKey.value = ''
  decryptedPassword.value = ''
  showSecretKey.value = false
  hasSecretKeyError.value = false
  secretKeyErrorMessage.value = ''
  hasEncryptedKeyError.value = false
  encryptedKeyErrorMessage.value = ''
}

const closeDecryptDialog = () => {
  decryptDialog.value = false
  // Clear sensitive data when closing
  secretKey.value = ''
  encryptedKey.value = ''
  decryptedPassword.value = ''
  showSecretKey.value = false
  hasSecretKeyError.value = false
  secretKeyErrorMessage.value = ''
  hasEncryptedKeyError.value = false
  encryptedKeyErrorMessage.value = ''
}

const performDecrypt = async () => {
  // Reset error states
  hasSecretKeyError.value = false
  secretKeyErrorMessage.value = ''
  hasEncryptedKeyError.value = false
  encryptedKeyErrorMessage.value = ''

  // Validate inputs
  let hasErrors = false

  if (!secretKey.value.trim()) {
    hasSecretKeyError.value = true
    secretKeyErrorMessage.value = 'Please enter your secret key'
    hasErrors = true
  }

  if (!encryptedKey.value.trim()) {
    hasEncryptedKeyError.value = true
    encryptedKeyErrorMessage.value = 'Please enter encrypted data'
    hasErrors = true
  }

  if (hasErrors) return

  isDecrypting.value = true

  try {
    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = decryptWithCustomKey(encryptedKey.value.trim(), secretKey.value.trim())

    decryptedPassword.value = result

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Password decrypted successfully! 🔓',
      timeout: 2000,
    })
  } catch (error) {
    console.error('Decryption error:', error)

    // Check if it's likely a wrong secret key vs corrupted data
    if (error.message.includes('Invalid secret key')) {
      hasSecretKeyError.value = true
      secretKeyErrorMessage.value = 'Incorrect secret key'
    } else {
      hasEncryptedKeyError.value = true
      encryptedKeyErrorMessage.value = 'Invalid encrypted data format'
    }

    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Decryption failed. Check your inputs.',
      timeout: 2500,
    })
  } finally {
    isDecrypting.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(decryptedPassword.value)
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Password copied to clipboard! 📋',
      timeout: 1500,
    })
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = decryptedPassword.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Password copied! 📋',
      timeout: 1500,
    })
  }
}

const showClearData = () => {
  $q.dialog({
    title: 'Clear Data?',
    message: 'This will delete all passwords.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    $q.notify({
      spinner: true,
      color: 'info',
      message: 'Clearing data...',
      position: 'top',
      timeout: 1000,
    })
    await removeCredentials()
    setTimeout(() => {
      $q.notify({
        color: 'positive',
        message: 'Successfully cleared data.',
        position: 'top',
        timeout: 2000,
      })
    }, 2000)
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

/* Top Section - 8% */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 8%;
  min-height: 45px;
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

/* Monitor Center - 50% */
.monitor-center {
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 0;
}

/* Stats Section - 22% */
.stats-section {
  height: 22%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 500px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 20px;
  opacity: 0.8;
}

.stat-info {
  flex: 1;
  text-align: left;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #60a5fa;
  line-height: 1;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Action Section - 20% */
.action-section {
  height: 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
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

/* PIN Entry Popup */
.pin-popup {
  background: #1f2937;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  color: white;
  min-width: 320px;
  max-width: 90vw;
}

.pin-display {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  transition: all 0.2s ease;
}

.pin-dot.filled {
  background: #60a5fa;
  border-color: #60a5fa;
}

.pin-dot.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.pin-keypad {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.keypad-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.keypad-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keypad-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.keypad-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.keypad-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.keypad-btn.primary {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.keypad-btn.primary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
}

.keypad-btn.secondary {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.keypad-btn.secondary:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
}

.pin-error {
  color: #ef4444;
  font-size: 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
}

.back-btn-pin {
  margin-top: 16px;
  min-width: 80px;
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

/* Decrypt Popup */
.decrypt-popup {
  background: #1f2937;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  color: white;
  min-width: 320px;
  max-width: 90vw;
}

.decrypt-input {
  margin-top: 16px;
}

.decrypt-input :deep(.q-field__control) {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
}

.decrypt-input :deep(.q-field__native) {
  color: white;
}

.decrypt-input :deep(.q-placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.decrypted-result {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 16px;
  position: relative;
}

.result-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.result-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
  word-break: break-all;
  padding-right: 40px;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(8px);
}

.decrypt-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn-dialog {
  flex: 1;
  min-width: 100px;
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
@media (max-width: 480px) {
  .main-layout {
    padding: 12px;
  }

  .action-btn {
    padding: 12px 8px;
    min-height: 64px;
  }

  .action-btn span {
    font-size: 11px;
  }

  .welcome-popup,
  .decrypt-popup,
  .pin-popup {
    padding: 24px 20px;
    min-width: 240px;
  }

  .pin-display {
    gap: 8px;
  }

  .pin-dot {
    width: 14px;
    height: 14px;
  }

  .keypad-btn {
    width: 48px;
    height: 48px;
    font-size: 16px;
  }

  .monitor-center {
    height: 48%;
  }

  .stats-section {
    height: 24%;
  }

  .action-section {
    height: 20%;
  }

  .stat-card {
    padding: 8px 6px;
    gap: 6px;
  }

  .stat-icon {
    font-size: 16px;
  }

  .stat-value {
    font-size: 14px;
  }

  .stat-label {
    font-size: 9px;
  }
}

@media (max-width: 360px) {
  .main-layout {
    padding: 10px;
  }

  .action-section {
    gap: 8px;
  }

  .action-row {
    gap: 8px;
  }

  .action-btn {
    padding: 10px 6px;
    min-height: 56px;
  }

  .keypad-btn {
    width: 44px;
    height: 44px;
    font-size: 14px;
  }

  .stats-container {
    gap: 8px;
  }

  .stat-card {
    padding: 6px 4px;
    gap: 4px;
  }

  .stat-icon {
    font-size: 14px;
  }

  .stat-value {
    font-size: 12px;
  }

  .stat-label {
    font-size: 8px;
  }
}

/* Landscape adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .monitor-center {
    height: 50%;
  }

  .action-section {
    height: 40%;
  }

  .action-btn {
    min-height: 56px;
    padding: 12px 8px;
  }
}
</style>
