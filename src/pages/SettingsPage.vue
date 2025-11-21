<template>
  <q-page class="settings-page">
    <div class="settings-wrapper">
      <!-- Mobile-First Header -->
      <div class="header-bar">
        <div class="header-content">
          <h1 class="app-title">Settings</h1>
          <div class="header-accent"></div>
        </div>
      </div>

      <!-- Mobile-Optimized Content -->
      <div class="content-area">
        <!-- Compact Profile Section -->
        <div class="profile-section" @click="openProfileDialog">
          <div class="profile-info">
            <q-avatar size="40px" class="profile-avatar">
              <q-icon name="person" size="20px" color="white" />
            </q-avatar>
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
          <q-icon name="chevron_right" size="18px" class="profile-arrow" />
        </div>

        <!-- Mobile-First Settings List -->
        <div class="settings-list">
          <!-- Security Section -->
          <div class="settings-section">
            <div class="section-header">
              <q-icon name="security" size="20px" class="section-icon security-color" />
              <h3 class="section-title">Security</h3>
            </div>

            <div class="setting-item">
              <div class="setting-main">
                <q-icon name="fingerprint" size="18px" class="item-icon" />
                <span class="item-text">Biometric Authentication</span>
              </div>
              <q-toggle
                v-model="useFingerprint"
                color="teal"
                size="sm"
                @update:model-value="saveFingerprintSetting"
              />
            </div>

            <div class="setting-item clickable" @click="openPinDialog">
              <div class="setting-main">
                <q-icon name="lock" size="18px" class="item-icon" />
                <span class="item-text">Change PIN</span>
              </div>
              <q-btn flat dense size="sm" color="orange-6" label="Update" class="update-btn" />
            </div>
          </div>

          <!-- Preferences Section -->
          <div class="settings-section">
            <div class="section-header">
              <q-icon name="tune" size="20px" class="section-icon preferences-color" />
              <h3 class="section-title">Preferences</h3>
            </div>

            <div class="setting-item clickable" @click="notifyFeature">
              <div class="setting-main">
                <q-icon name="notifications" size="18px" class="item-icon" />
                <span class="item-text">Notifications</span>
              </div>
              <q-icon name="chevron_right" size="16px" class="nav-icon" />
            </div>

            <div class="setting-item clickable" @click="notifyFeature">
              <div class="setting-main">
                <q-icon name="palette" size="18px" class="item-icon" />
                <span class="item-text">Theme Settings</span>
              </div>
              <q-icon name="chevron_right" size="16px" class="nav-icon" />
            </div>
          </div>

          <!-- Account Section -->
          <!-- <div class="settings-section">
            <div class="section-header">
              <q-icon name="person" size="20px" class="section-icon account-color" />
              <h3 class="section-title">Account</h3>
            </div>

            <div class="setting-item clickable" @click="notifyFeature">
              <div class="setting-main">
                <q-icon name="backup" size="18px" class="item-icon" />
                <span class="item-text">Backup & Sync</span>
              </div>
              <q-icon name="chevron_right" size="16px" class="nav-icon" />
            </div>

            <div class="setting-item clickable" @click="notifyFeature">
              <div class="setting-main">
                <q-icon name="sync" size="18px" class="item-icon" />
                <span class="item-text">Data Synchronization</span>
              </div>
              <q-icon name="chevron_right" size="16px" class="nav-icon" />
            </div>
          </div> -->

          <!-- Support Section -->
          <div class="settings-section">
            <div class="section-header">
              <q-icon name="help_outline" size="20px" class="section-icon support-color" />
              <h3 class="section-title">Support</h3>
            </div>

            <div class="setting-item clickable" @click="notifyFeature">
              <div class="setting-main">
                <q-icon name="contact_support" size="18px" class="item-icon" />
                <span class="item-text">Help & Support</span>
              </div>
              <q-icon name="chevron_right" size="16px" class="nav-icon" />
            </div>

            <div class="setting-item clickable" @click="openAboutDialog">
              <div class="setting-main">
                <q-icon name="info_outline" size="18px" class="item-icon" />
                <span class="item-text">About App</span>
              </div>
              <q-icon name="chevron_right" size="16px" class="nav-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile-Optimized Profile Dialog -->
    <q-dialog v-model="profileDialog" position="bottom">
      <q-card class="mobile-dialog">
        <div class="dialog-header">
          <h2 class="dialog-title">Edit Profile</h2>
          <q-btn flat round dense icon="close" @click="closeProfileDialog" class="dialog-close" />
        </div>

        <div class="dialog-content">
          <div class="input-section">
            <label class="field-label">Display Name</label>
            <q-input
              v-model="tempProfileName"
              outlined
              dense
              class="mobile-input"
              :placeholder="
                (currentUser?.nickname || '').charAt(0).toUpperCase() +
                (currentUser?.nickname || '').slice(1)
              "
            />
          </div>

          <div class="input-section">
            <label class="field-label">Profile Avatar</label>

            <!-- Simple Avatar Display -->
            <div class="profile-avatar-display">
              <q-avatar size="80px" class="profile-avatar-large">
                <q-icon name="person" size="40px" color="white" />
              </q-avatar>
              <div class="avatar-info">
                <span class="avatar-text">Default Avatar</span>
                <span class="avatar-subtext">Icon-based profile</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeProfileDialog" class="cancel-btn" />
          <q-btn
            unelevated
            label="Save Changes"
            @click="saveProfile"
            class="save-btn"
            :loading="savingProfile"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Mobile-Optimized PIN Dialog -->
    <q-dialog v-model="pinDialog" position="bottom">
      <q-card class="mobile-dialog">
        <div class="dialog-header">
          <h2 class="dialog-title">Change PIN</h2>
          <q-btn flat round dense icon="close" @click="closePinDialog" class="dialog-close" />
        </div>

        <div class="dialog-content">
          <div class="input-section">
            <label class="field-label">Current PIN</label>
            <q-input
              v-model="currentPin"
              type="password"
              outlined
              dense
              class="mobile-input"
              placeholder="Enter current PIN"
              maxlength="4"
              :rules="[(val) => val.length === 4 || 'PIN must be 4 digits']"
            />
          </div>

          <div class="input-section">
            <label class="field-label">New PIN</label>
            <q-input
              v-model="newPin"
              type="password"
              outlined
              dense
              class="mobile-input"
              placeholder="Enter new PIN (4 digits)"
              maxlength="4"
              :rules="[
                (val) => val.length === 4 || 'PIN must be 4 digits',
                (val) => val !== currentPin || 'New PIN cannot be the same as the current PIN',
                (val) => val !== null || 'PIN is required',
              ]"
            />
          </div>

          <div class="input-section">
            <label class="field-label">Confirm PIN</label>
            <q-input
              v-model="confirmPin"
              type="password"
              outlined
              dense
              class="mobile-input"
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
          <q-btn flat label="Cancel" @click="closePinDialog" class="cancel-btn" />
          <q-btn
            unelevated
            label="Update PIN"
            @click="savePin"
            class="save-btn"
            :loading="savingPin"
          />
        </div>
      </q-card>
    </q-dialog>
    <AboutDialog v-model="showAboutDialog" @close="handleAboutClose" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import useAuth from 'src/composables/useAuth'
import AboutDialog from 'src/components/AboutDialog.vue'
const { getCurrentUser, updateCurrentUser } = useAuth()
const $q = useQuasar()

// User data
const currentUser = ref(null)
const tempProfileName = ref('')
const useFingerprint = ref(false)

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

onMounted(() => {
  isCordova.value = !!window.cordova
  isCapacitor.value = !!window.Capacitor
  loadCurrentUser()
})

// Load current user data
function loadCurrentUser() {
  const user = getCurrentUser()
  if (user) {
    currentUser.value = user
    tempProfileName.value = user.name || ''
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

async function saveFingerprintSetting() {
  $q.notify({
    color: 'info',
    message: '🚧 This feature is still under construction!',
    icon: 'construction',
    position: 'top',
  })
}
</script>

<style scoped>
/* MOBILE-FIRST DESIGN - 320px and up */
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f9 0%, #e8f5f5 100%);
  padding: 0;
}

.settings-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Compact Mobile Header */
.header-bar {
  background: linear-gradient(135deg, #003366 0%, #004080 100%);
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 51, 102, 0.15);
}

.header-content {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-accent {
  width: 30px;
  height: 2px;
  background: #ff8c42;
  border-radius: 1px;
  margin-top: 6px;
}

/* Mobile-First Content Area */
.content-area {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* Compact Profile Section */
.profile-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-section:active {
  transform: scale(0.98);
  background: #f8fafc;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.profile-avatar {
  border: 2px solid #ff8c42;
  flex-shrink: 0;
  background: linear-gradient(135deg, #008080, #003366);
}

.profile-details {
  min-width: 0;
  flex: 1;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: #003366;
  margin-bottom: 2px;
  line-height: 1.2;
}

.profile-subtitle {
  font-size: 12px;
  color: #7cb342;
  font-weight: 500;
}

.profile-arrow {
  color: #94a3b8;
  flex-shrink: 0;
}

/* Mobile-Optimized Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.section-icon {
  flex-shrink: 0;
}

.security-color {
  color: #008080;
}
.preferences-color {
  color: #ff8c42;
}
.account-color {
  color: #7cb342;
}
.support-color {
  color: #64748b;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #003366;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-radius: 8px;
  transition: background 0.2s ease;
  min-height: 44px; /* Better touch target */
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid #f8fafc;
}

.setting-item.clickable {
  cursor: pointer;
  margin: 0 -8px;
  padding: 12px 8px;
}

.setting-item.clickable:active {
  background: rgba(0, 0, 0, 0.02);
}

.setting-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.item-icon {
  color: #64748b;
  flex-shrink: 0;
}

.item-text {
  font-size: 14px;
  font-weight: 500;
  color: #003366;
  line-height: 1.3;
}

.update-btn {
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 140, 66, 0.1);
  min-height: auto;
  flex-shrink: 0;
  min-width: 60px; /* Ensures button is always visible */
}

.nav-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

/* Mobile Dialog Styling */
.mobile-dialog {
  width: 100%;
  max-width: none;
  margin: 0;
  border-radius: 20px 20px 0 0;
  background: white;
  max-height: 85vh;
  overflow: hidden;
}

/* Simple Avatar Display Styles */
.profile-avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.profile-avatar-large {
  background: linear-gradient(135deg, #008080, #003366);
  border: 3px solid #008080;
  box-shadow: 0 4px 12px rgba(0, 128, 128, 0.2);
}

.avatar-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.avatar-text {
  font-size: 14px;
  font-weight: 600;
  color: #003366;
}

.avatar-subtext {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #003366;
  margin: 0;
}

.dialog-close {
  color: #64748b;
  width: 32px;
  height: 32px;
}

.dialog-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 50vh;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f8fafc;
  border-color: #e2e8f0;
  min-height: 48px; /* Better touch target */
}

.mobile-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1);
}

.mobile-input :deep(.q-field__native) {
  font-size: 16px; /* Prevents zoom on iOS */
  color: #003366;
  font-weight: 500;
}

.dialog-actions {
  padding: 16px 20px 20px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.cancel-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  background: #e2e8f0;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
}

.save-btn {
  flex: 2;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #008080, #003366);
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 128, 128, 0.3);
}

.save-btn:active {
  transform: translateY(1px);
}

/* Tablet Optimizations (768px+) */
@media (min-width: 768px) {
  .settings-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }

  .content-area {
    padding: 24px;
    gap: 24px;
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
    padding: 24px;
  }

  .dialog-content {
    padding: 24px;
  }

  .dialog-actions {
    padding: 20px 24px 24px;
  }
}

/* Desktop Optimizations (1024px+) */
@media (min-width: 1024px) {
  .settings-wrapper {
    max-width: 800px;
  }

  .content-area {
    padding: 32px;
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
    padding: 12px;
    gap: 16px;
  }

  .profile-section {
    padding: 12px;
  }

  .settings-section {
    padding: 12px;
  }

  .section-header {
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 12px;
  }

  .item-text {
    font-size: 13px;
  }

  .update-btn {
    font-size: 10px;
    padding: 4px 8px;
    min-width: 55px;
  }

  .dialog-content {
    padding: 16px;
  }

  .dialog-actions {
    padding: 12px 16px 16px;
  }
}

/* Accessibility & Touch Improvements */
@media (hover: none) {
  .setting-item.clickable:hover {
    background: transparent;
  }

  .profile-section:hover {
    background: white;
  }
}

/* Safe area for devices with notches */
@supports (padding: env(safe-area-inset-top)) {
  .header-bar {
    padding-top: max(12px, env(safe-area-inset-top));
  }
}

/* Prevent horizontal scrolling */
* {
  box-sizing: border-box;
}

.settings-page {
  overflow-x: hidden;
}
</style>
