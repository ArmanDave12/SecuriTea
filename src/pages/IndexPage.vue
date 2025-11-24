<template>
  <q-page class="password-manager-app">
    <!-- Animated search bar at top -->
    <transition name="search-slide" appear>
      <div class="search-container">
        <q-input
          v-model="search"
          dense
          placeholder="Search credentials..."
          outlined
          class="search-input"
          bg-color="white"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" size="18px" class="search-icon" />
          </template>
        </q-input>
      </div>
    </transition>

    <!-- Main Content with staggered animations -->
    <div class="content-container">
      <!-- Empty state with bounce animation -->
      <transition name="empty-bounce" appear>
        <div v-if="filteredCredentials.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <q-icon name="search_off" size="32px" class="empty-icon" />
            <div class="icon-pulse-ring"></div>
          </div>
          <div class="text-subtitle2 empty-title">No matching credentials</div>
          <div class="text-caption empty-description">Try adjusting your search</div>
        </div>
      </transition>

      <!-- Enhanced credential list with staggered animations -->
      <transition-group
        name="credential-list"
        tag="div"
        v-if="filteredCredentials !== 0"
        class="credential-list"
        appear
      >
        <q-card
          v-for="(credential, index) in filteredCredentials"
          :key="`${credential.id || index}-${credential.email}-${credential.username}`"
          class="credential-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="showPasswordDialog(index)"
          flat
          bordered
        >
          <q-card-section class="card-content">
            <div class="row items-center no-wrap justify-between">
              <!-- Enhanced platform icon with animation -->
              <div class="credential-icon-wrapper">
                <div class="credential-icon" :style="getPlatformInfo(credential).style">
                  <q-icon
                    v-if="getPlatformInfo(credential).isPlatform"
                    :name="getPlatformInfo(credential).icon"
                    size="18px"
                    color="white"
                  />
                  <span v-else class="icon-letter">{{ getPlatformInfo(credential).letter }}</span>
                </div>
                <div class="icon-glow"></div>
              </div>

              <!-- Enhanced credential details -->
              <div class="credential-details">
                <div class="credential-title">
                  {{ credential.username || 'No Username' }}
                  <span v-if="getPlatformInfo(credential).platformName" class="platform-badge">
                    {{ getPlatformInfo(credential).platformName }}
                  </span>
                </div>
                <div class="credential-username">
                  {{ credential.email || 'No Email' }}
                </div>
              </div>

              <!-- Enhanced visibility button -->
              <q-btn
                flat
                round
                dense
                class="visibility-btn"
                icon="visibility"
                size="sm"
                @click.stop="showPasswordDialog(index)"
                aria-label="View password"
              >
                <div class="btn-ripple"></div>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </transition-group>
    </div>

    <!-- Enhanced Password Dialog with slide animation -->
    <q-dialog
      v-model="passwordDialogOpen"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <transition name="dialog-content" appear>
        <q-card class="password-dialog-card">
          <!-- Enhanced Header with Platform Info -->
          <q-card-section
            class="dialog-header"
            :style="getPlatformInfo(activeCredential).headerStyle"
          >
            <div class="header-content">
              <div class="dialog-platform-icon" :style="getPlatformInfo(activeCredential).style">
                <q-icon
                  v-if="getPlatformInfo(activeCredential).isPlatform"
                  :name="getPlatformInfo(activeCredential).icon"
                  size="28px"
                  color="white"
                />
                <span v-else class="dialog-icon-letter">{{
                  getPlatformInfo(activeCredential).letter
                }}</span>
                <div class="platform-glow"></div>
              </div>
              <div class="dialog-info">
                <div class="dialog-title">
                  {{ activeCredential?.username || activeCredential?.email || 'Credential' }}
                </div>
                <div class="dialog-subtitle" v-if="getPlatformInfo(activeCredential).platformName">
                  {{ getPlatformInfo(activeCredential).platformName }}
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Enhanced Password Display Section -->
          <q-card-section class="password-section-wrapper">
            <div class="password-section">
              <div class="password-label">Password</div>
              <div class="password-value text-monospace">
                {{ activeCredential?.password || 'No Password' }}
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Enhanced Action Buttons -->
          <q-card-section class="actions-section">
            <div class="action-button" @click="copyActivePassword">
              <div class="action-icon-wrapper">
                <q-icon name="content_copy" class="action-icon" size="24px" />
                <div class="action-ripple"></div>
              </div>
              <div class="action-label">Copy</div>
            </div>

            <div class="action-button" @click="editActiveCredential">
              <div class="action-icon-wrapper">
                <q-icon name="edit" class="action-icon" size="24px" />
                <div class="action-ripple"></div>
              </div>
              <div class="action-label">Edit</div>
            </div>

            <div class="action-button" @click="confirmDeleteActive">
              <div class="action-icon-wrapper">
                <q-icon name="delete" class="action-icon delete-icon" size="24px" />
                <div class="action-ripple"></div>
              </div>
              <div class="action-label">Delete</div>
            </div>
          </q-card-section>
        </q-card>
      </transition>
    </q-dialog>

    <!-- Enhanced Floating Action Button -->
    <div class="fab-container">
      <transition name="fab-bounce" appear>
        <q-fab
          class="custom-fab"
          icon="add"
          direction="up"
          size="md"
          padding="md"
          :persistent="$q.screen.lt.sm"
        >
          <q-fab-action
            class="fab-action fab-action-teal"
            icon="password"
            size="sm"
            label="Password Generator"
            external-label
            label-position="left"
            @click="openPasswordGenerator"
          />
          <q-fab-action
            class="fab-action fab-action-blue"
            icon="cloud_download"
            size="sm"
            label="Import Credentials"
            external-label
            label-position="left"
            @click="openImportDialog"
          />
          <q-fab-action
            class="fab-action fab-action-orange"
            icon="add"
            size="sm"
            label="New Credential"
            external-label
            label-position="left"
            @click="openAddDialog"
          />
        </q-fab>
      </transition>
    </div>

    <!-- Add Credential Dialog Component -->
    <AddCredsDialog
      v-model="addDialogOpen"
      :platform-options="platformOptions"
      :require-email="requireEmail"
      :require-username="requireUsername"
      :require-password="requirePassword"
      @add-creds="addCredsFunc"
    />

    <!-- Enhanced Edit Credential Dialog -->
    <q-dialog
      v-model="editDialogOpen"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <transition name="dialog-content" appear>
        <q-card class="dialog-card">
          <q-toolbar class="custom-toolbar text-white mobile-toolbar">
            <q-btn flat round dense icon="arrow_back" v-close-popup />
            <q-toolbar-title class="text-body1">Edit Credential</q-toolbar-title>
            <q-btn flat dense label="Update" @click="updateCredential" />
          </q-toolbar>

          <q-card-section class="form-section">
            <q-form @submit="updateCredential" class="form-container">
              <!-- Similar enhanced form fields as add dialog -->
              <div class="form-field" :style="{ animationDelay: '0.1s' }">
                <q-select
                  dense
                  outlined
                  v-model="editingCredential.platform"
                  :options="platformOptions"
                  label="Platform (Optional)"
                  class="custom-input"
                  clearable
                  option-label="title"
                  option-value="name"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="category" class="input-icon" size="sm" />
                  </template>
                </q-select>
              </div>

              <div class="form-field" :style="{ animationDelay: '0.2s' }">
                <q-input
                  dense
                  outlined
                  v-model="editingCredential.email"
                  :label="requireEmail ? 'Email *' : 'Email'"
                  class="custom-input"
                  :rules="requireEmail ? [(val) => !!val || 'Email is required'] : []"
                  type="email"
                >
                  <template v-slot:prepend>
                    <q-icon name="mail" class="input-icon" size="sm" />
                  </template>
                </q-input>
              </div>

              <div class="form-field" :style="{ animationDelay: '0.3s' }">
                <q-input
                  dense
                  outlined
                  v-model="editingCredential.username"
                  :label="requireUsername ? 'Username *' : 'Username'"
                  class="custom-input"
                  :rules="requireUsername ? [(val) => !!val || 'Username is required'] : []"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" class="input-icon" size="sm" />
                  </template>
                </q-input>
              </div>

              <div class="form-field" :style="{ animationDelay: '0.4s' }">
                <q-input
                  dense
                  outlined
                  v-model="editingCredential.password"
                  label="Password *"
                  class="custom-input"
                  :type="showEditPassword ? 'text' : 'password'"
                  :rules="[(val) => !!val || 'Password is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="vpn_key" class="input-icon" size="sm" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showEditPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer input-icon toggle-icon"
                      size="sm"
                      @click="toggleEditPassword"
                    />
                  </template>
                </q-input>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </transition>
    </q-dialog>

    <!-- Enhanced Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialogOpen" transition-show="scale" transition-hide="scale">
      <transition name="delete-bounce" appear>
        <q-card class="delete-dialog-card">
          <q-card-section class="delete-header">
            <div class="delete-icon-wrapper">
              <q-icon name="warning" class="delete-warning-icon" size="32px" />
              <div class="warning-pulse"></div>
            </div>
            <div class="delete-title">Delete Credential</div>
          </q-card-section>

          <q-card-section class="delete-content">
            Are you sure you want to delete "{{
              deleteCredential?.username || deleteCredential?.email || 'this credential'
            }}"?
          </q-card-section>

          <q-card-actions class="delete-actions">
            <q-btn flat class="cancel-btn" label="Cancel" v-close-popup />
            <q-btn
              flat
              class="delete-confirm-btn"
              label="Delete"
              @click="deleteSelectedCredential"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </transition>
    </q-dialog>

    <!-- Import Credentials Dialog Component -->
    <ImportCredsDialog
      v-model="importDialogOpen"
      :credentials="credentials"
      @import-complete="handleImportComplete"
      @export-complete="handleExportComplete"
    />

    <!-- Password Generator Component -->
    <GenerateBtn
      v-model="passwordGeneratorOpen"
      :options="passwordOptions"
      :generated-password="generatedPassword"
      @update:options="passwordOptions = $event"
      @update:generated-password="generatedPassword = $event"
      @password-generated="onPasswordGenerated"
      @password-copied="onPasswordCopied"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePasswords } from 'src/composables/usePasswords'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { socMeds } from 'src/composables/usePlatforms'
import GenerateBtn from 'src/components/GenerateBtn.vue'
import AddCredsDialog from 'src/components/AddCredsDialog.vue'
import ImportCredsDialog from 'src/components/ImportCredsDialog.vue'

// State
const search = ref('')
const addDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const passwordDialogOpen = ref(false)
const showEditPassword = ref(false)
const passwordGeneratorOpen = ref(false)
const importDialogOpen = ref(false)
const $q = useQuasar()
const { addCredential, getCredentials, removeCredential, editCred, error, loading } = usePasswords()
const secretCount = ref(0)
const router = useRouter()

// Field requirements (configurable)
const requireEmail = ref(true)
const requireUsername = ref(false)
const requirePassword = ref(true)
const showFieldOptions = ref(false)

// Platform options for dropdown
const platformOptions = computed(() => socMeds)

// Password generator
const generatedPassword = ref('p@ssw0rdGen3r4t0r!')
const passwordOptions = ref({
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
})
const importOption = ref('csv')

// Active credential for dialog
const activeCredential = ref(null)

// Initial credentials
const credentials = ref([])
const editingCredential = ref({
  platform: '',
  email: '',
  username: '',
  password: '',
  isVisible: false,
  index: -1,
})
const deleteCredential = ref(null)

// Enhanced password visibility toggle for edit dialog
const toggleEditPassword = () => {
  showEditPassword.value = !showEditPassword.value
}

// Helper function to adjust color brightness
const adjustBrightness = (color, percent) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const adjustedR = Math.max(0, Math.min(255, r + (r * percent) / 100))
  const adjustedG = Math.max(0, Math.min(255, g + (g * percent) / 100))
  const adjustedB = Math.max(0, Math.min(255, b + (b * percent) / 100))

  return `#${Math.round(adjustedR).toString(16).padStart(2, '0')}${Math.round(adjustedG).toString(16).padStart(2, '0')}${Math.round(adjustedB).toString(16).padStart(2, '0')}`
}

// SIMPLIFIED getPlatformInfo - uses stored platform value directly
const getPlatformInfo = (credential) => {
  if (!credential) {
    return {
      icon: 'account_circle',
      color: '#64748B',
      isPlatform: false,
      letter: '?',
      platformName: '',
      style: { backgroundColor: '#64748B' },
      headerStyle: { background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)' },
    }
  }

  // Use the stored platform value directly
  if (credential.platform) {
    const platform = socMeds.find((p) => p.name === credential.platform)
    if (platform) {
      return {
        icon: platform.icon,
        color: platform.color,
        isPlatform: true,
        letter: null,
        platformName: platform.title,
        style: { backgroundColor: platform.color },
        headerStyle: {
          background: `linear-gradient(135deg, ${platform.color} 0%, ${adjustBrightness(platform.color, -20)} 100%)`,
        },
      }
    }
  }

  // Fallback to first letter with a nice gradient
  const text = credential.username || credential.email || '?'
  const letter = text.charAt(0).toUpperCase()
  const colors = [
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#84CC16',
  ]
  const colorIndex = letter.charCodeAt(0) % colors.length
  const baseColor = colors[colorIndex]

  return {
    icon: null,
    color: baseColor,
    isPlatform: false,
    letter: letter,
    platformName: '',
    style: { backgroundColor: baseColor },
    headerStyle: {
      background: `linear-gradient(135deg, ${baseColor} 0%, ${adjustBrightness(baseColor, -20)} 100%)`,
    },
  }
}

const loadCredentials = async () => {
  const response = await getCredentials()
  credentials.value = response || []
}

// Updated addCredsFunc to handle the new event structure from AddCredsDialog
const addCredsFunc = async (formData) => {
  await addCredential(formData.email, formData.password, formData.username, formData.platform)
  addDialogOpen.value = false
  await loadCredentials()
}

// Computed property for filtered credentials
const filteredCredentials = computed(() => {
  const searchTerm = search.value?.toLowerCase().trim()
  if (!searchTerm) return credentials.value || []

  return (credentials.value || []).filter((cred) => {
    const email = cred?.email || ''
    const username = cred?.username || ''
    const platform = getPlatformInfo(cred).platformName || ''

    return (
      email.toLowerCase().includes(searchTerm) ||
      username.toLowerCase().includes(searchTerm) ||
      platform.toLowerCase().includes(searchTerm)
    )
  })
})

// Show password dialog
const showPasswordDialog = (index) => {
  const credentialsList = filteredCredentials.value
  if (index < 0 || index >= credentialsList.length) return

  activeCredential.value = credentialsList[index]
  passwordDialogOpen.value = true
}

// Helper to find the original index of a credential
const findCredentialIndex = (credential) => {
  return credentials.value.findIndex(
    (c) =>
      c?.email === credential?.email &&
      c?.username === credential?.username &&
      c?.password === credential?.password,
  )
}

const openAddDialog = () => {
  addDialogOpen.value = true
}

const copyPassword = (password) => {
  navigator.clipboard
    .writeText(password || '')
    .then(() => {
      passwordDialogOpen.value = false

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Password copied to clipboard',
        icon: 'check',
        timeout: 2000,
      })
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Failed to copy password',
        icon: 'error',
      })
    })
}

const copyActivePassword = () => {
  if (activeCredential.value?.password) {
    copyPassword(activeCredential.value.password)
  }
}

const editActiveCredential = () => {
  if (activeCredential.value) {
    const index = findCredentialIndex(activeCredential.value)
    editCredential(index)
    passwordDialogOpen.value = false
  }
}

const confirmDeleteActive = () => {
  if (activeCredential.value) {
    const index = findCredentialIndex(activeCredential.value)
    confirmDelete(index)
    passwordDialogOpen.value = false
  }
}

const editCredential = (index) => {
  if (index < 0 || index >= credentials.value.length) return

  const credential = credentials.value[index]
  editingCredential.value = {
    id: credential.id,
    platform: credential.platform || '',
    email: credential.email || '',
    username: credential.username || '',
    password: credential.password || '',
    isVisible: credential.isVisible || false,
    index: index,
  }
  showEditPassword.value = false
  editDialogOpen.value = true
}

const updateCredential = async () => {
  const credentialToEdit = editingCredential.value
  if (!credentialToEdit) return

  // Use the editCred API function
  const success = await editCred(
    credentialToEdit.id,
    credentialToEdit.email,
    credentialToEdit.password,
    credentialToEdit.username,
    credentialToEdit.platform,
  )

  if (success) {
    // Update local state only if API call succeeded
    const index = credentialToEdit.index
    if (index >= 0 && index < credentials.value.length) {
      credentials.value[index].platform = credentialToEdit.platform
      credentials.value[index].email = credentialToEdit.email
      credentials.value[index].username = credentialToEdit.username
      credentials.value[index].password = credentialToEdit.password
    }
  }
  // editCred will handle error notifications

  editDialogOpen.value = false
}

const confirmDelete = (index) => {
  if (index >= 0 && index < credentials.value.length) {
    deleteCredential.value = credentials.value[index]
    deleteDialogOpen.value = true
  }
}

const deleteSelectedCredential = async () => {
  const credentialToDelete = deleteCredential.value
  if (!credentialToDelete) return

  // Use the removeCredential API function
  const success = await removeCredential(credentialToDelete.id)

  if (success) {
    // Remove from local state only if API call succeeded
    const index = findCredentialIndex(credentialToDelete)
    if (index >= 0) {
      credentials.value.splice(index, 1)
    }
  }
  // removeCredential will handle error notifications

  deleteCredential.value = null
}

// Password generator event handlers
const onPasswordGenerated = (password) => {
  console.log('Password generated:', password)
}

const onPasswordCopied = (password) => {
  // This could be used to set a generated password to a form if needed
  console.log('Password copied from generator:', password)
}

const openPasswordGenerator = () => {
  passwordGeneratorOpen.value = true
}

const openImportDialog = () => {
  importOption.value = 'csv'
  importDialogOpen.value = true
}

// Updated import handler to work with the new ImportCredsDialog component
const handleImportComplete = async ({ credentials, count }) => {
  try {
    // Process each credential through the API
    for (const cred of credentials) {
      await addCredential(
        cred.email || '',
        cred.password || '',
        cred.username || '',
        cred.platform || '',
      )
    }

    // Reload credentials to show imported ones
    await loadCredentials()

    // Show success notification
    $q.notify({
      color: 'positive',
      position: 'top',
      message: `Successfully imported ${count} credentials from CSV`,
      icon: 'cloud_done',
      timeout: 3000,
    })
  } catch (error) {
    console.error('Failed to import credentials:', error)
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to import some credentials',
      icon: 'error',
      timeout: 3000,
    })
  }
}

const handleExportComplete = ({ count }) => {
  $q.notify({
    color: 'positive',
    position: 'top',
    message: `Successfully exported ${count} credentials to CSV`,
    icon: 'cloud_done',
    timeout: 3000,
  })
}

onMounted(async () => {
  await loadCredentials()
})
</script>

<style scoped>
/* Enhanced page transitions */
.search-slide-enter-active {
  animation: searchSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.empty-bounce-enter-active {
  animation: emptyBounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
}

.credential-list-enter-active {
  animation: credentialSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.credential-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.credential-list-leave-active {
  position: absolute;
  right: 0;
  left: 0;
  transition: all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.credential-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.dialog-content-enter-active {
  animation: dialogSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fab-bounce-enter-active {
  animation: fabBounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.8s both;
}

.delete-bounce-enter-active {
  animation: deleteBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Keyframes for main transitions */
@keyframes searchSlideIn {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes emptyBounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes credentialSlideIn {
  0% {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes dialogSlideUp {
  0% {
    transform: translateY(40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fabBounceIn {
  0% {
    transform: translateY(50px) scale(0.3);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
  70% {
    transform: translateY(5px) scale(0.9);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes deleteBounceIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Enhanced styling with platform-aware colors */
.password-manager-app {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* Enhanced Search Container */
.search-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 20px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.search-input {
  width: 100%;
  max-width: 100%;
}

.search-input :deep(.q-field__control) {
  border-radius: 16px !important;
  border: 2px solid rgba(226, 232, 240, 0.6) !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-input :deep(.q-field--focused .q-field__control) {
  border-color: rgba(0, 128, 128, 0.6) !important;
  box-shadow:
    0 0 0 3px rgba(0, 128, 128, 0.1),
    0 4px 12px rgba(0, 128, 128, 0.15) !important;
  background: #ffffff !important;
  transform: translateY(-1px);
}

.search-input :deep(.q-field__native) {
  padding: 14px 16px !important;
  font-size: 16px !important;
  color: #334155 !important;
}

.search-input :deep(.q-field__label) {
  color: #64748b !important;
  font-size: 16px !important;
  font-weight: 500;
}

.search-icon {
  color: #64748b !important;
  margin-left: 4px;
  transition: all 0.3s ease;
}

.search-input:focus-within .search-icon {
  color: #008080 !important;
  transform: scale(1.1);
}

.content-container {
  flex: 1;
  padding: 12px 8px;
  width: 100%;
  margin: 0 auto;
}

/* Enhanced empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.5);
  padding: 40px 24px;
  margin: 20px 0;
  position: relative;
}

.empty-icon-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.empty-icon {
  color: #64748b !important;
  position: relative;
  z-index: 2;
}

.icon-pulse-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(100, 116, 139, 0.2);
  border-radius: 50%;
  animation: emptyPulse 2s infinite ease-in-out;
}

@keyframes emptyPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.empty-title {
  color: #475569 !important;
  font-weight: 600;
  margin-bottom: 4px;
}

.empty-description {
  color: #64748b !important;
}

/* Enhanced credential cards */
.credential-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 80px;
}

.credential-card {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6) !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.credential-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 128, 128, 0.05) 50%, transparent 100%);
  transition: left 0.6s ease;
}

.credential-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 128, 128, 0.15);
  border-color: rgba(0, 128, 128, 0.4) !important;
  background: #ffffff;
}

.credential-card:hover::before {
  left: 100%;
}

.card-content {
  padding: 16px !important;
}

/* Enhanced credential icon */
.credential-icon-wrapper {
  position: relative;
}

.credential-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.credential-card:hover .credential-icon {
  transform: scale(1.1);
}

.icon-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 16px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.credential-card:hover .icon-glow {
  opacity: 1;
}

.icon-letter {
  font-size: 18px;
  font-weight: 700;
}

.credential-details {
  margin: 0 16px;
  flex: 1;
  min-width: 0;
}

.credential-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  font-size: 15px;
  color: #475569 !important;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.credential-card:hover .credential-title {
  color: #008080 !important;
}

.platform-badge {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 128, 128, 0.15) 100%);
  color: #008080 !important;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(0, 128, 128, 0.2);
}

.credential-username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b !important;
  font-size: 13px;
  transition: color 0.3s ease;
}

.credential-card:hover .credential-username {
  color: #475569 !important;
}

/* Enhanced visibility button */
.visibility-btn {
  color: #64748b !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.visibility-btn:hover {
  color: #008080 !important;
  background: rgba(0, 128, 128, 0.1) !important;
  transform: scale(1.1);
}

.btn-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: all 0.3s ease;
}

.visibility-btn:active .btn-ripple {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s ease;
}

/* Enhanced Password Dialog */
.password-dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  color: white;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: headerShimmer 3s linear infinite;
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
  align-items: center;
  position: relative;
  z-index: 2;
}

.dialog-platform-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  margin-right: 16px;
}

.platform-glow {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 24px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  animation: platformGlow 2s ease-in-out infinite;
}

@keyframes platformGlow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.dialog-icon-letter {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.dialog-info {
  flex: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dialog-subtitle {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

/* Enhanced password section */
.password-section-wrapper {
  padding: 20px !important;
}

.password-section {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(30, 58, 138, 0.08) 100%);
  border: 2px solid rgba(0, 128, 128, 0.15);
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.password-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 128, 128, 0.5) 50%, transparent 100%);
}

.password-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.password-value {
  font-size: 18px;
  color: #008080 !important;
  line-height: 1.4;
  word-break: break-all;
  font-weight: 600;
  text-align: center;
}

/* Enhanced action buttons */
.actions-section {
  display: flex;
  justify-content: space-around;
  padding: 16px 20px !important;
  gap: 8px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex: 1;
  position: relative;
  overflow: hidden;
}

.action-button:hover {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 128, 128, 0.12) 100%);
  transform: translateY(-2px);
}

.action-icon-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.action-icon {
  color: #008080 !important;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.delete-icon {
  color: #ef4444 !important;
}

.action-button:hover .action-icon {
  transform: scale(1.15);
}

.action-ripple {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.action-button:active .action-ripple {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s ease;
}

.action-label {
  font-size: 12px;
  color: #64748b !important;
  font-weight: 600;
  transition: color 0.3s ease;
}

.action-button:hover .action-label {
  color: #008080 !important;
}

/* Enhanced FAB */
.fab-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 15;
}

.custom-fab {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  box-shadow:
    0 8px 32px rgba(0, 128, 128, 0.4),
    0 4px 16px rgba(30, 58, 138, 0.3) !important;
  color: white !important;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.custom-fab:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 128, 128, 0.5),
    0 6px 20px rgba(30, 58, 138, 0.4) !important;
}

.fab-action {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.fab-action:hover {
  transform: scale(1.1);
}

.fab-action-teal {
  background: linear-gradient(135deg, #008080 0%, #006666 100%) !important;
}

.fab-action-blue {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
}

.fab-action-orange {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%) !important;
}

/* Enhanced dialogs */
.dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.custom-toolbar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  min-height: 56px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-toolbar {
  min-height: 56px;
  padding: 8px 16px;
}

/* Enhanced form styling */
.form-section {
  padding: 24px 20px !important;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  animation: formFieldSlide 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes formFieldSlide {
  0% {
    transform: translateY(20px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.custom-input {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.custom-input :deep(.q-field__control) {
  border-color: rgba(226, 232, 240, 0.8) !important;
  border-width: 2px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow:
    0 0 0 3px rgba(0, 128, 128, 0.15),
    0 4px 12px rgba(0, 128, 128, 0.1);
  background: #ffffff;
  transform: translateY(-1px);
}

.custom-input :deep(.q-field__label) {
  color: #64748b !important;
  font-weight: 500;
}

.custom-input :deep(.q-field--focused .q-field__label) {
  color: #008080 !important;
}

.input-icon {
  color: #64748b !important;
  transition: all 0.3s ease;
}

.custom-input:focus-within .input-icon {
  color: #008080 !important;
  transform: scale(1.1);
}

.toggle-icon {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.toggle-icon:hover {
  color: #008080 !important;
  transform: scale(1.2);
}

/* Enhanced delete dialog */
.delete-dialog-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 320px;
  margin: 0 auto;
}

.delete-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
}

.delete-icon-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.delete-warning-icon {
  color: #ef4444 !important;
  position: relative;
  z-index: 2;
}

.warning-pulse {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  animation: warningPulse 2s infinite ease-in-out;
}

@keyframes warningPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.delete-title {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444 !important;
  text-align: center;
}

.delete-content {
  padding: 16px 24px !important;
  text-align: center;
  color: #475569 !important;
  line-height: 1.5;
}

.delete-actions {
  padding: 16px 24px !important;
  justify-content: space-between;
  gap: 12px;
}

.cancel-btn {
  color: #64748b !important;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(100, 116, 139, 0.15);
  transform: translateY(-1px);
}

.delete-confirm-btn {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.delete-confirm-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .search-container {
    padding: 16px 12px;
  }

  .credential-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .credential-title {
    font-size: 14px;
  }

  .credential-username {
    font-size: 12px;
  }

  .dialog-header {
    padding: 20px 16px;
  }

  .dialog-platform-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .password-section-wrapper {
    padding: 16px !important;
  }

  .actions-section {
    padding: 12px 16px !important;
  }

  .form-section {
    padding: 20px 16px !important;
  }
}

/* Dark mode enhancements */
.body--dark .password-manager-app {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.body--dark .search-container {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-bottom-color: rgba(71, 85, 105, 0.5);
}

.body--dark .search-input :deep(.q-field__control) {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border-color: rgba(71, 85, 105, 0.6) !important;
}

.body--dark .search-input :deep(.q-field--focused .q-field__control) {
  background: #334155 !important;
  border-color: rgba(16, 185, 129, 0.6) !important;
  box-shadow:
    0 0 0 3px rgba(16, 185, 129, 0.15),
    0 4px 12px rgba(16, 185, 129, 0.1) !important;
}

.body--dark .search-input :deep(.q-field__native) {
  color: #e5e7eb !important;
}

.body--dark .search-input :deep(.q-field__label) {
  color: #94a3b8 !important;
}

.body--dark .search-icon {
  color: #94a3b8 !important;
}

.body--dark .search-input:focus-within .search-icon {
  color: #10b981 !important;
}

.body--dark .empty-state {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-color: rgba(71, 85, 105, 0.5);
}

.body--dark .empty-title {
  color: #94a3b8 !important;
}

.body--dark .empty-description {
  color: #64748b !important;
}

.body--dark .credential-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-color: rgba(71, 85, 105, 0.6) !important;
}

.body--dark .credential-card:hover {
  background: #1e293b;
  border-color: rgba(16, 185, 129, 0.4) !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
}

.body--dark .credential-title {
  color: #e5e7eb !important;
}

.body--dark .credential-card:hover .credential-title {
  color: #10b981 !important;
}

.body--dark .credential-username {
  color: #94a3b8 !important;
}

.body--dark .credential-card:hover .credential-username {
  color: #e5e7eb !important;
}

.body--dark .platform-badge {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.2) 100%);
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.3);
}

.body--dark .visibility-btn {
  color: #94a3b8 !important;
}

.body--dark .visibility-btn:hover {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
}
</style>
