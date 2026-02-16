<template>
  <q-page class="settings-page">
    <div class="settings-wrapper">
      <!-- Animated Mobile-First Header -->
      <transition name="header-slide" appear>
        <div class="header-bar">
          <div class="header-content">
            <h1 class="app-title">Settings</h1>
            <div class="header-accent"></div>
          </div>
        </div>
      </transition>

      <!-- Enhanced Mobile-Optimized Content -->
      <div class="content-area">
        <!-- Animated Compact Profile Section -->
        <transition name="profile-slide" appear>
          <div class="profile-section" @click="openProfileDialog">
            <div class="profile-info">
              <div class="avatar-wrapper">
                <q-avatar size="44px" class="profile-avatar">
                  <q-icon name="person" size="22px" color="white" />
                </q-avatar>
                <div class="avatar-glow"></div>
                <div class="online-indicator"></div>
              </div>
              <div class="profile-details">
                <div class="profile-name">
                  {{
                    (currentUser?.nickname || 'Guest User').charAt(0).toUpperCase() +
                    (currentUser?.nickname || 'Guest User').slice(1)
                  }}
                </div>
                <div class="profile-subtitle">Tap to edit profile</div>
              </div>
            </div>
            <div class="profile-arrow-wrapper">
              <q-icon name="chevron_right" size="18px" class="profile-arrow" />
            </div>
            <div class="profile-shine"></div>
          </div>
        </transition>

        <!-- Enhanced Mobile-First Settings List -->
        <div class="settings-list">
          <!-- Security Section with staggered animation -->
          <transition name="section-slide" appear :style="{ animationDelay: '0.1s' }">
            <div class="settings-section">
              <div class="section-header">
                <div class="section-icon-wrapper">
                  <q-icon name="security" size="20px" class="section-icon security-color" />
                  <div class="icon-pulse security-pulse"></div>
                </div>
                <h3 class="section-title">Security</h3>
                <div class="section-accent security-accent"></div>
              </div>

              <div class="setting-item">
                <div class="setting-main">
                  <q-icon :name="getBiometricIcon()" size="18px" class="item-icon" />
                  <div class="item-content">
                    <span class="item-text">{{ getBiometricText() }}</span>
                    <span v-if="!biometricAvailable" class="item-subtitle"
                      >Not available on this device</span
                    >
                  </div>
                </div>
                <q-toggle
                  v-model="useFingerprint"
                  :disable="!biometricAvailable"
                  color="teal"
                  size="sm"
                  @update:model-value="toggleBiometric"
                  class="enhanced-toggle"
                />
              </div>

              <div class="setting-item clickable" @click="openPinDialog">
                <div class="setting-main">
                  <q-icon name="lock" size="18px" class="item-icon" />
                  <span class="item-text">Change PIN</span>
                </div>
                <q-btn flat dense size="sm" color="orange-6" label="Update" class="update-btn">
                  <div class="btn-ripple"></div>
                </q-btn>
              </div>
            </div>
          </transition>

          <!-- Preferences Section with staggered animation -->
          <transition name="section-slide" appear :style="{ animationDelay: '0.2s' }">
            <div class="settings-section">
              <div class="section-header">
                <div class="section-icon-wrapper">
                  <q-icon name="tune" size="20px" class="section-icon preferences-color" />
                  <div class="icon-pulse preferences-pulse"></div>
                </div>
                <h3 class="section-title">Preferences</h3>
                <div class="section-accent preferences-accent"></div>
              </div>

              <div class="setting-item clickable" @click="notifyFeature">
                <div class="setting-main">
                  <q-icon name="notifications" size="18px" class="item-icon" />
                  <span class="item-text">Notifications</span>
                </div>
                <div class="nav-icon-wrapper">
                  <q-icon name="chevron_right" size="16px" class="nav-icon" />
                </div>
              </div>

              <!-- <div class="setting-item clickable" @click="notifyFeature">
                <div class="setting-main">
                  <q-icon name="palette" size="18px" class="item-icon" />
                  <span class="item-text">Theme Settings</span>
                </div>
                <div class="nav-icon-wrapper">
                  <q-icon name="chevron_right" size="16px" class="nav-icon" />
                </div>
              </div> -->
              <div class="setting-item">
                <div class="setting-main">
                  <q-icon name="dark_mode" size="18px" class="item-icon" />
                  <span class="item-text">Dark Mode</span>
                </div>
                <q-toggle
                  :model-value="isDarkMode"
                  @update:model-value="toggleDarkMode"
                  color="teal"
                  class="enhanced-toggle"
                  checked-icon="dark_mode"
                  unchecked-icon="light_mode"
                />
              </div>
            </div>
          </transition>

          <!-- Support Section with staggered animation -->
          <transition name="section-slide" appear :style="{ animationDelay: '0.3s' }">
            <div class="settings-section">
              <div class="section-header">
                <div class="section-icon-wrapper">
                  <q-icon name="help_outline" size="20px" class="section-icon support-color" />
                  <div class="icon-pulse support-pulse"></div>
                </div>
                <h3 class="section-title">Support</h3>
                <div class="section-accent support-accent"></div>
              </div>

              <div class="setting-item clickable" @click="notifyFeature">
                <div class="setting-main">
                  <q-icon name="contact_support" size="18px" class="item-icon" />
                  <span class="item-text">Help & Support</span>
                </div>
                <div class="nav-icon-wrapper">
                  <q-icon name="chevron_right" size="16px" class="nav-icon" />
                </div>
              </div>

              <div class="setting-item clickable" @click="openAboutDialog">
                <div class="setting-main">
                  <q-icon name="info_outline" size="18px" class="item-icon" />
                  <span class="item-text">About App</span>
                </div>
                <div class="nav-icon-wrapper">
                  <q-icon name="chevron_right" size="16px" class="nav-icon" />
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Enhanced Mobile-Optimized Profile Dialog -->
    <q-dialog
      v-model="profileDialog"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <transition name="dialog-content" appear>
        <q-card class="mobile-dialog">
          <div class="dialog-header">
            <h2 class="dialog-title">Edit Profile</h2>
            <q-btn flat round dense icon="close" @click="closeProfileDialog" class="dialog-close">
              <div class="close-ripple"></div>
            </q-btn>
          </div>

          <div class="dialog-content">
            <!-- Enhanced input sections with staggered animations -->
            <div class="input-section" :style="{ animationDelay: '0.1s' }">
              <label class="field-label">Display Name</label>
              <q-input
                v-model="tempProfileName"
                outlined
                dense
                class="mobile-input enhanced-input"
                :placeholder="
                  (currentUser?.nickname || '').charAt(0).toUpperCase() +
                  (currentUser?.nickname || '').slice(1)
                "
              />
            </div>

            <div class="input-section" :style="{ animationDelay: '0.2s' }">
              <label class="field-label">Profile Avatar</label>

              <div class="profile-avatar-display">
                <div class="avatar-display-wrapper">
                  <q-avatar size="80px" class="profile-avatar-large">
                    <q-icon name="person" size="40px" color="white" />
                  </q-avatar>
                  <div class="avatar-glow-large"></div>
                </div>
                <div class="avatar-info">
                  <span class="avatar-text">Default Avatar</span>
                  <span class="avatar-subtext">Icon-based profile</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <q-btn flat label="Cancel" @click="closeProfileDialog" class="cancel-btn enhanced-btn">
              <div class="btn-ripple"></div>
            </q-btn>
            <q-btn
              unelevated
              label="Save Changes"
              @click="saveProfile"
              class="save-btn enhanced-btn"
              :loading="savingProfile"
            >
              <div class="btn-ripple"></div>
            </q-btn>
          </div>
        </q-card>
      </transition>
    </q-dialog>

    <!-- Enhanced Mobile-Optimized PIN Dialog -->
    <q-dialog
      v-model="pinDialog"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <transition name="dialog-content" appear>
        <q-card class="mobile-dialog">
          <div class="dialog-header">
            <h2 class="dialog-title">Change PIN</h2>
            <q-btn flat round dense icon="close" @click="closePinDialog" class="dialog-close">
              <div class="close-ripple"></div>
            </q-btn>
          </div>

          <div class="dialog-content">
            <!-- Enhanced PIN input sections with staggered animations -->
            <div class="input-section" :style="{ animationDelay: '0.1s' }">
              <label class="field-label">Current PIN</label>
              <q-input
                v-model="currentPin"
                type="password"
                outlined
                dense
                class="mobile-input enhanced-input"
                placeholder="Enter current PIN"
                maxlength="4"
                :rules="[(val) => val.length === 4 || 'PIN must be 4 digits']"
              />
            </div>

            <div class="input-section" :style="{ animationDelay: '0.2s' }">
              <label class="field-label">New PIN</label>
              <q-input
                v-model="newPin"
                type="password"
                outlined
                dense
                class="mobile-input enhanced-input"
                placeholder="Enter new PIN (4 digits)"
                maxlength="4"
                :rules="[
                  (val) => val.length === 4 || 'PIN must be 4 digits',
                  (val) => val !== currentPin || 'New PIN cannot be the same as the current PIN',
                  (val) => val !== null || 'PIN is required',
                ]"
              />
            </div>

            <div class="input-section" :style="{ animationDelay: '0.3s' }">
              <label class="field-label">Confirm PIN</label>
              <q-input
                v-model="confirmPin"
                type="password"
                outlined
                dense
                class="mobile-input enhanced-input"
                placeholder="Confirm new PIN"
                maxlength="4"
                :rules="[
                  (val) => val.length === 4 || 'PIN must be 4 digits',
                  (val) => val === newPin || 'PINs do not match',
                ]"
              />
            </div>
          </div>

          <div class="dialog-actions">
            <q-btn flat label="Cancel" @click="closePinDialog" class="cancel-btn enhanced-btn">
              <div class="btn-ripple"></div>
            </q-btn>
            <q-btn
              unelevated
              label="Update PIN"
              @click="savePin"
              class="save-btn enhanced-btn"
              :loading="savingPin"
            >
              <div class="btn-ripple"></div>
            </q-btn>
          </div>
        </q-card>
      </transition>
    </q-dialog>

    <AboutDialog v-model="showAboutDialog" @close="handleAboutClose" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import useAuth from 'src/composables/useAuth'
import AboutDialog from 'src/components/AboutDialog.vue'
import BiometricService from 'src/services/biometric'
import { useDarkMode } from 'src/composables/useDarkMode'

const { isDarkMode, toggleDarkMode } = useDarkMode()
const { getCurrentUser, updateCurrentUser } = useAuth()
const $q = useQuasar()
const biometricService = new BiometricService()

// User data
const currentUser = ref(null)
const tempProfileName = ref('')
const useFingerprint = ref(false)
const biometricAvailable = ref(false)
const biometricType = ref('biometric')

// PIN change data
const currentPin = ref('')
const newPin = ref('')
const confirmPin = ref('')

// Dialog states
const profileDialog = ref(false)
const pinDialog = ref(false)
const savingProfile = ref(false)
const savingPin = ref(false)
const showAboutDialog = ref(false)

// Device detection
const isCordova = ref(false)
const isCapacitor = ref(false)

onMounted(async () => {
  isCordova.value = !!window.cordova
  isCapacitor.value = !!window.Capacitor
  await loadCurrentUser()
  await checkBiometricAvailability()
})

async function checkBiometricAvailability() {
  biometricAvailable.value = await biometricService.isAvailable()
  if (biometricAvailable.value) {
    biometricType.value = await biometricService.getBiometricType()
  }
}

// Load current user data
async function loadCurrentUser() {
  const user = getCurrentUser()
  if (user) {
    currentUser.value = user
    tempProfileName.value = user.name || ''
    useFingerprint.value = await biometricService.isBiometricEnabled()
  }
}

function getBiometricIcon() {
  switch (biometricType.value?.toLowerCase()) {
    case 'faceid':
    case 'face':
      return 'face'
    case 'touchid':
    case 'fingerprint':
      return 'fingerprint'
    default:
      return 'fingerprint'
  }
}

function getBiometricText() {
  if (!biometricAvailable.value) {
    return 'Biometric Authentication'
  }

  switch (biometricType.value?.toLowerCase()) {
    case 'faceid':
    case 'face':
      return 'Face ID Authentication'
    case 'touchid':
    case 'fingerprint':
      return 'Fingerprint Authentication'
    default:
      return 'Biometric Authentication'
  }
}

async function toggleBiometric(enabled) {
  if (!biometricAvailable.value) {
    useFingerprint.value = false
    return
  }

  try {
    if (enabled) {
      const success = await biometricService.enableBiometric()
      if (!success) {
        useFingerprint.value = false
      }
    } else {
      await biometricService.disableBiometric()
    }
  } catch (error) {
    console.error('Error toggling biometric:', error)
    useFingerprint.value = !enabled // Revert toggle
  }
}

function openProfileDialog() {
  tempProfileName.value = currentUser.value?.name || ''
  profileDialog.value = true
}

function closeProfileDialog() {
  profileDialog.value = false
  // Reset temp values
  tempProfileName.value = currentUser.value?.name || ''
}

function openAboutDialog() {
  showAboutDialog.value = true
}

function handleAboutClose() {
  showAboutDialog.value = false
}

function openPinDialog() {
  pinDialog.value = true
}

function closePinDialog() {
  pinDialog.value = false
  // Clear PIN fields
  currentPin.value = ''
  newPin.value = ''
  confirmPin.value = ''
}

async function saveProfile() {
  savingProfile.value = true

  try {
    const updateData = {
      name: tempProfileName.value,
    }

    const result = await updateCurrentUser(updateData)
    if (result) {
      profileDialog.value = false
      await loadCurrentUser() // Reload user data
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update profile',
      icon: 'error',
      position: 'top',
    })
  } finally {
    savingProfile.value = false
  }
}

async function savePin() {
  // Validation checks
  if (!currentPin.value) {
    $q.notify({
      color: 'negative',
      message: 'Please enter your current PIN',
      icon: 'error',
      position: 'top',
    })
    return
  }

  if (!newPin.value || newPin.value.length !== 4 || !/^\d{4}$/.test(newPin.value)) {
    $q.notify({
      color: 'negative',
      message: 'New PIN must be exactly 4 digits',
      icon: 'error',
      position: 'top',
    })
    return
  }

  if (newPin.value !== confirmPin.value) {
    $q.notify({
      color: 'negative',
      message: 'New PIN and Confirm PIN do not match',
      icon: 'error',
      position: 'top',
    })
    return
  }

  savingPin.value = true

  try {
    const updateData = {
      pin: currentPin.value,
      newPin: newPin.value,
    }
    const result = await updateCurrentUser(updateData)
    if (result) {
      $q.notify({
        color: 'positive',
        message: 'PIN updated successfully',
        icon: 'check',
        position: 'top',
      })
      closePinDialog()

      // If biometric is enabled, update stored credentials
      if (useFingerprint.value) {
        await biometricService.enableBiometric() // Re-enable with new credentials
      }
    }
  } catch (error) {
    console.error('Error updating PIN:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update PIN',
      icon: 'error',
      position: 'top',
    })
  } finally {
    savingPin.value = false
  }
}

function notifyFeature() {
  $q.notify({
    color: 'info',
    message: '🚧 This feature is still under construction!',
    icon: 'construction',
    position: 'top',
  })
}
</script>

<style scoped>
/* Enhanced page transitions */
.header-slide-enter-active {
  animation: headerSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.profile-slide-enter-active {
  animation: profileSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
}

.section-slide-enter-active {
  animation: sectionSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.dialog-content-enter-active {
  animation: dialogContentSlide 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Keyframes for main transitions */
@keyframes headerSlideIn {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes profileSlideIn {
  0% {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes sectionSlideIn {
  0% {
    transform: translateY(25px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes dialogContentSlide {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes inputSlideIn {
  0% {
    transform: translateX(-15px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* MOBILE-FIRST DESIGN - 320px and up */
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f9 0%, #e8f5f5 50%, #f0f9f9 100%);
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

.settings-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 128, 128, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 140, 66, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.settings-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Enhanced Compact Mobile Header */
.header-bar {
  background: linear-gradient(135deg, #003366 0%, #004080 100%);
  padding: 16px 20px;
  box-shadow:
    0 4px 20px rgba(0, 51, 102, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.header-bar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  animation: headerShimmer 6s linear infinite;
}

@keyframes headerShimmer {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.header-content {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.app-title {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-accent {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #ff8c42 0%, #ff6b1a 100%);
  border-radius: 2px;
  margin-top: 8px;
  box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
  animation: accentGlow 3s ease-in-out infinite;
}

@keyframes accentGlow {
  0%,
  100% {
    box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
  }
  50% {
    box-shadow: 0 2px 8px rgba(255, 140, 66, 0.6);
  }
}

/* Enhanced Mobile-First Content Area */
.content-area {
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* Enhanced Compact Profile Section */
.profile-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.profile-section:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 30px rgba(0, 128, 128, 0.15);
  border-color: rgba(0, 128, 128, 0.3);
}

.profile-section:active {
  transform: translateY(-1px) scale(1.005);
}

.profile-shine {
  position: absolute;
  top: -50%;
  left: -100%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: left 0.6s ease;
  pointer-events: none;
}

.profile-section:hover .profile-shine {
  left: 100%;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.avatar-wrapper {
  position: relative;
}

.profile-avatar {
  border: 3px solid rgba(255, 140, 66, 0.8);
  flex-shrink: 0;
  background: linear-gradient(135deg, #008080 0%, #003366 100%);
  box-shadow: 0 4px 16px rgba(0, 128, 128, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
}

.profile-section:hover .profile-avatar {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 128, 128, 0.4);
}

.avatar-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: avatarGlow 3s ease-in-out infinite;
}

@keyframes avatarGlow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: onlinePulse 2s infinite ease-in-out;
}

@keyframes onlinePulse {
  0% {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.profile-details {
  min-width: 0;
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #003366;
  margin-bottom: 4px;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.profile-section:hover .profile-name {
  color: #008080;
}

.profile-subtitle {
  font-size: 13px;
  color: #7cb342;
  font-weight: 600;
  transition: all 0.3s ease;
}

.profile-section:hover .profile-subtitle {
  color: #65a30d;
  transform: translateX(2px);
}

.profile-arrow-wrapper {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.profile-section:hover .profile-arrow-wrapper {
  transform: translateX(4px);
}

.profile-arrow {
  color: #94a3b8;
  transition: color 0.3s ease;
}

.profile-section:hover .profile-arrow {
  color: #008080;
}

/* Enhanced Mobile-Optimized Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.settings-section:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  position: relative;
}

.section-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.section-icon {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
}

.icon-pulse {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  opacity: 0.3;
  animation: iconPulse 3s infinite ease-in-out;
}

@keyframes iconPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
}

.security-color {
  color: #008080;
}

.preferences-color {
  color: #ff8c42;
}

.support-color {
  color: #64748b;
}

.security-pulse {
  background: radial-gradient(circle, rgba(0, 128, 128, 0.2) 0%, transparent 70%);
}

.preferences-pulse {
  background: radial-gradient(circle, rgba(255, 140, 66, 0.2) 0%, transparent 70%);
}

.support-pulse {
  background: radial-gradient(circle, rgba(100, 116, 139, 0.2) 0%, transparent 70%);
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #003366;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.section-accent {
  height: 2px;
  width: 20px;
  border-radius: 1px;
  flex-shrink: 0;
}

.security-accent {
  background: linear-gradient(90deg, #008080 0%, #006666 100%);
}

.preferences-accent {
  background: linear-gradient(90deg, #ff8c42 0%, #ff6b1a 100%);
}

.support-accent {
  background: linear-gradient(90deg, #64748b 0%, #475569 100%);
}

/* Enhanced setting items */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 48px;
  position: relative;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid rgba(248, 250, 252, 0.8);
}

.setting-item.clickable {
  cursor: pointer;
  margin: 0 -12px;
  padding: 14px 12px;
}

.setting-item.clickable:hover {
  background: rgba(0, 128, 128, 0.04);
  transform: translateX(2px);
}

.setting-item.clickable:active {
  background: rgba(0, 128, 128, 0.08);
  transform: translateX(1px);
}

.setting-main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.item-icon {
  color: #64748b;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.setting-item.clickable:hover .item-icon {
  color: #008080;
  transform: scale(1.1);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.item-text {
  font-size: 15px;
  font-weight: 600;
  color: #003366;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.item-subtitle {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  line-height: 1.2;
}

.setting-item.clickable:hover .item-text {
  color: #008080;
}

/* Enhanced buttons and controls */
.update-btn {
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 140, 66, 0.15) 100%);
  border: 1px solid rgba(255, 140, 66, 0.2);
  min-height: auto;
  flex-shrink: 0;
  min-width: 70px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.update-btn:hover {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(255, 140, 66, 0.2) 100%);
  border-color: rgba(255, 140, 66, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.2);
}

.enhanced-toggle :deep(.q-toggle__inner) {
  color: #008080 !important;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.enhanced-toggle :deep(.q-toggle__thumb) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-icon-wrapper {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.setting-item.clickable:hover .nav-icon-wrapper {
  transform: translateX(2px);
}

.nav-icon {
  color: #94a3b8;
  transition: color 0.3s ease;
}

.setting-item.clickable:hover .nav-icon {
  color: #008080;
}

/* Enhanced Button Ripple Effects */
.btn-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: inherit;
}

.update-btn:active .btn-ripple,
.enhanced-btn:active .btn-ripple {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s ease;
}

/* Enhanced Mobile Dialog Styling */
.mobile-dialog {
  width: 100%;
  max-width: none;
  margin: 0;
  border-radius: 20px 20px 0 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}

.dialog-title {
  font-size: 20px;
  font-weight: 800;
  color: #003366;
  margin: 0;
}

.dialog-close {
  color: #64748b;
  width: 36px;
  height: 36px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dialog-close:hover {
  color: #008080;
  background: rgba(0, 128, 128, 0.1);
  transform: scale(1.1);
}

.close-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.dialog-close:active .close-ripple {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s ease;
}

.dialog-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  max-height: 50vh;
}

/* Enhanced input sections */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: inputSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.enhanced-input {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-input :deep(.q-field__control) {
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid rgba(226, 232, 240, 0.8);
  min-height: 52px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080;
  background: #ffffff;
  box-shadow:
    0 0 0 3px rgba(0, 128, 128, 0.15),
    0 4px 12px rgba(0, 128, 128, 0.1);
  transform: translateY(-1px);
}

.mobile-input :deep(.q-field__native) {
  font-size: 16px;
  color: #003366;
  font-weight: 500;
  padding: 16px 18px;
}

/* Enhanced Avatar Display */
.profile-avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 24px;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 128, 128, 0.08) 100%);
  border-radius: 18px;
  border: 1px solid rgba(0, 128, 128, 0.1);
  position: relative;
  overflow: hidden;
}

.avatar-display-wrapper {
  position: relative;
}

.profile-avatar-large {
  background: linear-gradient(135deg, #008080 0%, #003366 100%);
  border: 4px solid rgba(0, 128, 128, 0.8);
  box-shadow: 0 8px 32px rgba(0, 128, 128, 0.3);
  position: relative;
  z-index: 2;
}

.avatar-glow-large {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: avatarGlowLarge 4s ease-in-out infinite;
}

@keyframes avatarGlowLarge {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.avatar-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.avatar-text {
  font-size: 16px;
  font-weight: 700;
  color: #003366;
}

.avatar-subtext {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Enhanced dialog actions */
.dialog-actions {
  padding: 20px 24px 24px;
  display: flex;
  gap: 16px;
  border-top: 1px solid rgba(241, 245, 249, 0.8);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.enhanced-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cancel-btn {
  flex: 1;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.5) 0%, rgba(226, 232, 240, 0.8) 100%);
  border: 2px solid rgba(226, 232, 240, 0.8);
  color: #64748b;
  font-weight: 700;
  font-size: 15px;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.8) 0%, rgba(203, 213, 225, 0.8) 100%);
  border-color: rgba(203, 213, 225, 0.8);
  transform: translateY(-1px);
}

.save-btn {
  flex: 2;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #008080 0%, #003366 100%);
  color: white;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 6px 20px rgba(0, 128, 128, 0.4);
  border: none;
}

.save-btn:hover {
  background: linear-gradient(135deg, #006666 0%, #002244 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 128, 128, 0.5);
}

.save-btn:active {
  transform: translateY(-1px);
}

/* Tablet Optimizations (768px+) */
@media (min-width: 768px) {
  .settings-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }

  .content-area {
    padding: 32px 24px;
    gap: 28px;
  }

  .app-title {
    font-size: 28px;
  }

  .mobile-dialog {
    width: 500px;
    max-width: 90vw;
    margin: auto;
    border-radius: 20px;
    max-height: 70vh;
  }

  .dialog-header {
    padding: 28px;
  }

  .dialog-content {
    padding: 28px;
  }

  .dialog-actions {
    padding: 24px 28px 28px;
  }
}

/* Desktop Optimizations (1024px+) */
@media (min-width: 1024px) {
  .settings-wrapper {
    max-width: 800px;
  }

  .content-area {
    padding: 40px 32px;
    gap: 32px;
  }

  .settings-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .profile-section {
    grid-column: 1 / -1;
  }
}

/* Very Small Screens (320px specific optimizations) */
@media (max-width: 350px) {
  .content-area {
    padding: 16px 12px;
    gap: 20px;
  }

  .profile-section {
    padding: 16px;
  }

  .settings-section {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 13px;
  }

  .item-text {
    font-size: 14px;
  }

  .update-btn {
    font-size: 11px;
    padding: 6px 12px;
    min-width: 60px;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-actions {
    padding: 16px 20px 20px;
  }
}

/* Accessibility & Touch Improvements */
@media (hover: none) {
  .setting-item.clickable:hover {
    background: transparent;
    transform: none;
  }

  .profile-section:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    transform: none;
  }

  .profile-section:hover .profile-shine {
    left: -100%;
  }
}

/* Safe area for devices with notches */
@supports (padding: env(safe-area-inset-top)) {
  .header-bar {
    padding-top: max(16px, env(safe-area-inset-top));
  }
}

/* Prevent horizontal scrolling */
* {
  box-sizing: border-box;
}

.settings-page {
  overflow-x: hidden;
}

body.body--dark .settings-page {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
}

body.body--dark .settings-section {
  background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

body.body--dark .profile-section {
  background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

body.body--dark .section-title {
  color: #00a8a8;
}

body.body--dark .item-text {
  color: #e2e8f0;
}

body.body--dark .setting-item:not(:last-child) {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

body.body--dark .setting-item.clickable:hover {
  background: rgba(0, 168, 168, 0.1);
}

body.body--dark .header-bar {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

body.body--dark .app-title {
  color: #00a8a8;
}
</style>
