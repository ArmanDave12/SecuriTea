<template>
  <q-page class="pin-page">
    <div class="pin-viewport">
      <div class="pin-card">
        <!-- Logo/Branding Section -->
        <div class="brand-section">
          <div class="brand-logo-container">
            <q-avatar size="70px" font-size="35px" class="brand-avatar">
              <img src="../../assets/SecuriTea.png" alt="SecuriTea Logo" />
              <!-- Steam effect -->
              <div class="steam-accent steam-1"></div>
              <div class="steam-accent steam-2"></div>
              <div class="steam-accent steam-3"></div>
            </q-avatar>
          </div>
          <h3 class="brand-title">SecuriTea</h3>
        </div>

        <!-- Step 1: Account Selection -->
        <AccountSelection
          v-if="currentStep === 1"
          :accounts="accounts"
          :selected-account="selectedAccount"
          :loading-users="loadingUsers"
          @select-account="selectAccount"
          @refresh="loadUsers"
        />

        <!-- Step 2: PIN Entry -->
        <PinEntry
          v-if="currentStep === 2"
          :selected-account="selectedAccount"
          :pin="pin"
          :is-pin-visible="isPinVisible"
          :is-loading="isLoading"
          :pin-error="pinError"
          :is-locked="isLocked"
          :lock-time-left="lockTimeLeft"
          @change-account="goToStep1"
          @add-pin-digit="addPinDigit"
          @clear-pin="clearPin"
          @toggle-pin-visibility="togglePinVisibility"
        />

        <!-- Footer Section -->
        <div class="footer-section" v-if="!isLocked">
          <button type="button" class="footer-link" @click="forgotPinDialog = true">
            Forgot PIN?
          </button>
          <span class="link-separator">•</span>
          <router-link to="/signup" class="footer-link">Sign Up</router-link>
        </div>
      </div>
    </div>

    <!-- Forgot PIN Dialog Component -->
    <ForgotDialog
      :forgotPinDialog="forgotPinDialog"
      :selectedAccount="selectedAccount"
      @close="forgotPinDialog = false"
    />

    <!-- Account Locked Dialog Component -->
    <AccountLockedDialog
      :accountLockedDialog="accountLockedDialog"
      :selectedAccount="selectedAccount"
      :lockTimeLeft="lockTimeLeft"
      :maxAttempts="maxAttempts"
      @close="accountLockedDialog = false"
    />
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import useAuth from 'src/composables/useAuth'
import ForgotDialog from 'src/components/ForgotDialog.vue'
import AccountLockedDialog from 'src/components/AccountLockedDialog.vue'
import AccountSelection from 'src/components/AccountSelection.vue'
import PinEntry from 'src/components/PinEntry.vue'

const router = useRouter()
const $q = useQuasar()
const { login, getAllUsers, error, loading } = useAuth()

// Stepper state
const currentStep = ref(1)

// User/Account management
const accounts = ref([])
const loadingUsers = ref(false)
const selectedAccount = ref(null)

// PIN state variables
const pin = ref('')
const isPinVisible = ref(false)
const isLoading = loading
const pinError = ref(false)
const pinErrorMessage = ref('')
const forgotPinDialog = ref(false)
const accountLockedDialog = ref(false)

// Security state
const maxAttempts = ref(3)
const loginAttempts = ref(0)
const lockDuration = ref(30000) // 30 seconds
const lockTimeLeft = ref(0)
const isLocked = ref(false)
const lockTimer = ref(null)

// Load users function using getAllUsers
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const users = await getAllUsers()
    accounts.value = users || []
    console.log('Loaded users from getAllUsers:', accounts.value)
  } catch (err) {
    console.error('Error loading users:', err)
    accounts.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Function to show attempts left notification
const showAttemptsLeftNotification = () => {
  const attemptsLeft = maxAttempts.value - loginAttempts.value
  if (attemptsLeft > 0 && attemptsLeft < maxAttempts.value) {
    $q.notify({
      message: `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining`,
      icon: 'security',
      color: attemptsLeft === 1 ? 'negative' : 'warning',
      position: 'top',
      timeout: 3000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          size: 'sm',
        },
      ],
    })
  }
}

// Check for existing lockout on mount
onMounted(async () => {
  // Load users first
  await loadUsers()

  const savedAttempts = localStorage.getItem('securitea_login_attempts')
  const savedLockTime = localStorage.getItem('securitea_lock_time')
  const savedAccount = localStorage.getItem('securitea_selected_account')

  // Restore selected account if available and still exists in current users
  if (savedAccount && accounts.value.length > 0) {
    try {
      const accountData = JSON.parse(savedAccount)
      selectedAccount.value = accounts.value.find(
        (acc) => acc.id === accountData.id || acc.username === accountData.username,
      )
      if (selectedAccount.value) {
        currentStep.value = 2
        // Show attempts left notification if there were previous failed attempts
        if (savedAttempts) {
          loginAttempts.value = parseInt(savedAttempts)
          if (loginAttempts.value > 0) {
            setTimeout(() => {
              showAttemptsLeftNotification()
            }, 500)
          }
        }
      }
    } catch (e) {
      console.error('Error parsing saved account:', e)
      localStorage.removeItem('securitea_selected_account')
    }
  }

  if (savedAttempts) {
    loginAttempts.value = parseInt(savedAttempts)
  }

  if (savedLockTime) {
    const lockEndTime = parseInt(savedLockTime)
    const now = Date.now()

    if (now < lockEndTime) {
      lockTimeLeft.value = lockEndTime - now
      startLockTimer()
    } else {
      localStorage.removeItem('securitea_lock_time')
      localStorage.removeItem('securitea_login_attempts')
      loginAttempts.value = 0
    }
  }
})

onUnmounted(() => {
  if (lockTimer.value) {
    clearInterval(lockTimer.value)
  }
})

// Step navigation with stepper integration
const selectAccount = (account) => {
  selectedAccount.value = account
  localStorage.setItem('securitea_selected_account', JSON.stringify(account))

  // Auto-advance to step 2
  goToStep2()
}

const goToStep2 = () => {
  if (selectedAccount.value) {
    currentStep.value = 2
    // Reset PIN state when entering step 2
    pin.value = ''
    pinError.value = false
    pinErrorMessage.value = ''

    // Show attempts left notification if there are previous failed attempts
    if (loginAttempts.value > 0) {
      setTimeout(() => {
        showAttemptsLeftNotification()
      }, 300)
    }
  }
}

const goToStep1 = () => {
  if (currentStep.value > 1) {
    currentStep.value = 1
    // Clear PIN and selected account
    pin.value = ''
    selectedAccount.value = null
    pinError.value = false
    pinErrorMessage.value = ''
    localStorage.removeItem('securitea_selected_account')
  }
}

// PIN Functions
const addPinDigit = (digit) => {
  if (pin.value.length < 4 && !isLocked.value) {
    pin.value += digit.toString()

    if (pinError.value) {
      pinError.value = false
      pinErrorMessage.value = ''
    }

    // Auto-submit when 4 digits entered
    if (pin.value.length === 4) {
      setTimeout(() => {
        onSubmit()
      }, 200)
    }
  }
}

const clearPin = () => {
  if (!isLocked.value) {
    pin.value = pin.value.slice(0, -1)

    if (pinError.value) {
      pinError.value = false
      pinErrorMessage.value = ''
    }
  }
}

const togglePinVisibility = () => {
  if (!isLocked.value) {
    isPinVisible.value = !isPinVisible.value

    // Show PIN in notification when visible
    if (isPinVisible.value && pin.value.length > 0) {
      $q.notify({
        message: `Current PIN: ${pin.value}`,
        icon: 'visibility',
        color: 'info',
        position: 'top',
        timeout: 3000,
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            size: 'sm',
          },
        ],
      })
    }
  }
}

// Security Functions
const lockAccount = () => {
  isLocked.value = true
  lockTimeLeft.value = lockDuration.value

  const lockEndTime = Date.now() + lockDuration.value
  localStorage.setItem('securitea_lock_time', lockEndTime.toString())
  localStorage.setItem('securitea_login_attempts', loginAttempts.value.toString())

  accountLockedDialog.value = true
  startLockTimer()
}

const startLockTimer = () => {
  isLocked.value = true

  lockTimer.value = setInterval(() => {
    lockTimeLeft.value -= 1000

    if (lockTimeLeft.value <= 0) {
      clearInterval(lockTimer.value)
      isLocked.value = false
      lockTimeLeft.value = 0
      loginAttempts.value = 0

      localStorage.removeItem('securitea_lock_time')
      localStorage.removeItem('securitea_login_attempts')

      accountLockedDialog.value = false
    }
  }, 1000)
}

const handleFailedLogin = (errorMessage = 'Invalid PIN') => {
  loginAttempts.value++
  pinError.value = true
  pinErrorMessage.value = errorMessage

  pin.value = ''

  if (loginAttempts.value >= maxAttempts.value) {
    lockAccount()
  } else {
    localStorage.setItem('securitea_login_attempts', loginAttempts.value.toString())

    // Show attempts left notification
    setTimeout(() => {
      showAttemptsLeftNotification()
    }, 500)

    setTimeout(() => {
      pinError.value = false
      pinErrorMessage.value = ''
    }, 3000)
  }
}

// Submit handler
const onSubmit = async () => {
  if (isLocked.value || pin.value.length < 4 || !selectedAccount.value) return

  pinError.value = false
  pinErrorMessage.value = ''

  try {
    // Use selected account username with PIN for login
    const user = await login(selectedAccount.value.nickname, pin.value)
    if (user) {
      // Success - clear all stored data
      loginAttempts.value = 0
      localStorage.removeItem('securitea_login_attempts')
      localStorage.removeItem('securitea_lock_time')
      localStorage.removeItem('securitea_selected_account')

      router.push('/main')
    } else {
      handleFailedLogin(
        `Incorrect PIN for ${selectedAccount.value.nickname || selectedAccount.value.username}.`,
      )
    }
  } catch (err) {
    console.error('Login error:', err)
    handleFailedLogin('Authentication failed. Please try again.')
  }
}

// Watch for errors from useAuth
watch(error, (newError) => {
  if (newError) {
    handleFailedLogin(newError)
  }
})
</script>

<style scoped>
/* Base layout */
.pin-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.pin-viewport {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

.pin-card {
  width: 100%;
  max-width: 360px;
  height: auto;
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Brand section */
.brand-section {
  text-align: center;
  flex: 0 0 auto;
  margin-bottom: 12px;
}

.brand-logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.brand-avatar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
  position: relative;
  overflow: visible;
}

/* Steam Effect */
.steam-accent {
  position: absolute;
  background: #fb923c;
  border-radius: 50%;
  opacity: 0.7;
}

.steam-1 {
  width: 4px;
  height: 4px;
  top: -8px;
  left: 25px;
  animation: steam 2s infinite ease-in-out;
}

.steam-2 {
  width: 3px;
  height: 3px;
  top: -12px;
  left: 32px;
  animation: steam 2s infinite ease-in-out 0.5s;
}

.steam-3 {
  width: 2px;
  height: 2px;
  top: -6px;
  left: 38px;
  animation: steam 2s infinite ease-in-out 1s;
}

@keyframes steam {
  0% {
    opacity: 0.7;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.4;
    transform: translateY(-10px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
}

.brand-title {
  color: #008080 !important;
  font-size: 2rem;
  font-weight: 700;
  margin: 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

/* Footer */
.footer-section {
  flex: 0 0 auto;
  text-align: center;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-link {
  color: #65a30d !important;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
  padding: 2px 4px;
}

.footer-link:hover {
  border-bottom-color: #65a30d;
}

.link-separator {
  color: #94a3b8;
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .pin-card {
    max-width: 340px;
    padding: 16px;
  }

  .brand-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 360px) {
  .pin-card {
    padding: 14px;
  }

  .brand-title {
    font-size: 1.6rem;
  }
}

@media (max-height: 700px) {
  .pin-card {
    padding: 12px;
  }

  .brand-title {
    font-size: 1.7rem;
    margin: 4px 0;
  }
}

@media (max-height: 500px) {
  .pin-viewport {
    padding: 8px;
  }

  .pin-card {
    padding: 8px;
    border-radius: 12px;
  }

  .brand-title {
    font-size: 1.4rem;
    margin: 2px 0;
  }
}

/* Dark mode */
.body--dark .pin-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.body--dark .pin-card {
  background: #1e293b;
  border-color: #475569;
}

.body--dark .brand-title {
  color: #94a3b8 !important;
}
</style>
