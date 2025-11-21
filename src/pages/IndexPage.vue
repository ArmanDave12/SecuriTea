<!-- src/pages/IndexPage.vue -->
<template>
  <q-page class="password-manager-app">
    <!-- Fixed search bar at top -->
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

    <!-- Main Content - optimized for small screens -->
    <div class="content-container">
      <div v-if="filteredCredentials.length === 0" class="empty-state">
        <q-icon name="search_off" size="28px" class="empty-icon" />
        <div class="text-subtitle2 q-mt-xs">No matching credentials</div>
        <div class="text-caption q-mt-xs empty-text">Try adjusting your search</div>
      </div>

      <!-- Mobile-optimized credential list -->
      <div v-else class="credential-list">
        <q-card
          v-for="(credential, index) in filteredCredentials"
          :key="index"
          class="credential-card q-my-sm q-mx-md"
          @click="showPasswordDialog(index)"
          flat
          bordered
        >
          <q-card-section class="q-pa-xs">
            <div class="row items-center no-wrap justify-between">
              <!-- Platform icon or letter - SIMPLIFIED -->
              <div class="credential-icon" :style="getPlatformInfo(credential).style">
                <q-icon
                  v-if="getPlatformInfo(credential).isPlatform"
                  :name="getPlatformInfo(credential).icon"
                  size="16px"
                  color="white"
                />
                <span v-else class="icon-letter">{{ getPlatformInfo(credential).letter }}</span>
              </div>

              <!-- Title and Username -->
              <div class="credential-details">
                <div class="text-subtitle2 credential-title">
                  {{ credential.username || 'No Username' }}
                  <span v-if="getPlatformInfo(credential).platformName" class="platform-badge">
                    {{ getPlatformInfo(credential).platformName }}
                  </span>
                </div>
                <div class="text-caption credential-username">
                  {{ credential.email || 'No Email' }}
                </div>
              </div>

              <!-- Visibility button -->
              <q-btn
                flat
                round
                dense
                class="visibility-btn"
                icon="visibility"
                size="xs"
                @click.stop="showPasswordDialog(index)"
                aria-label="View password"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Password Dialog - Enhanced -->
    <q-dialog v-model="passwordDialogOpen" position="bottom">
      <q-card class="password-dialog-card">
        <!-- Enhanced Header with Platform Info -->
        <q-card-section
          class="dialog-header"
          :style="getPlatformInfo(activeCredential).headerStyle"
        >
          <div class="row items-center no-wrap">
            <div class="dialog-platform-icon" :style="getPlatformInfo(activeCredential).style">
              <q-icon
                v-if="getPlatformInfo(activeCredential).isPlatform"
                :name="getPlatformInfo(activeCredential).icon"
                size="24px"
                color="white"
              />
              <span v-else class="dialog-icon-letter">{{
                getPlatformInfo(activeCredential).letter
              }}</span>
            </div>
            <div class="q-ml-md">
              <div class="dialog-title">
                {{ activeCredential?.username || activeCredential?.email || 'Credential' }}
              </div>
              <div class="dialog-subtitle" v-if="getPlatformInfo(activeCredential).platformName">
                {{ getPlatformInfo(activeCredential).platformName }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Password Display Section -->
        <q-card-section class="q-py-sm">
          <div class="password-section">
            <div class="password-value text-monospace q-py-xs text-center">
              {{ activeCredential?.password || 'No Password' }}
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Action Buttons -->
        <q-card-section class="row justify-around q-py-sm">
          <div class="action-button" @click="copyActivePassword">
            <q-icon name="content_copy" class="action-icon-primary" size="24px" />
            <div class="action-label">Copy password</div>
          </div>

          <div class="action-button" @click="editActiveCredential">
            <q-icon name="edit" class="action-icon-primary" size="24px" />
            <div class="action-label">Edit</div>
          </div>

          <div class="action-button" @click="confirmDeleteActive">
            <q-icon name="delete" color="negative" size="24px" />
            <div class="action-label">Delete</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Mini Floating Action Button -->
    <div class="fab-container">
      <q-fab
        class="custom-fab"
        icon="add"
        direction="up"
        size="xs"
        padding="xs"
        :persistent="$q.screen.lt.sm"
      >
        <q-fab-action
          class="fab-action-teal"
          icon="password"
          size="sm"
          padding="xs"
          label="Password Generator"
          external-label
          label-position="left"
          @click="openPasswordGenerator"
        />
        <q-fab-action
          class="fab-action-blue"
          icon="cloud_download"
          size="sm"
          padding="xs"
          label="Import Credentials"
          external-label
          label-position="left"
          @click="openImportDialog"
        />
        <q-fab-action
          class="fab-action-orange"
          icon="add"
          size="sm"
          padding="xs"
          label="New Credential"
          external-label
          label-position="left"
          @click="openAddDialog"
        />
      </q-fab>
    </div>

    <!-- Add Credential Dialog -->
    <q-dialog v-model="addDialogOpen" position="bottom">
      <q-card class="dialog-card">
        <q-toolbar class="custom-toolbar text-white mobile-toolbar">
          <q-btn flat round dense icon="arrow_back" v-close-popup @click="resetNewCredential" />
          <q-toolbar-title class="text-body1">New Credential</q-toolbar-title>
          <q-btn flat dense label="Save" :disable="!isFormValid()" @click="addCredsFunc" />
        </q-toolbar>

        <q-card-section class="q-pt-md q-px-sm">
          <q-form @submit="addCredsFunc" class="form-container">
            <!-- Platform Selection - Enhanced -->
            <div class="form-field">
              <q-select
                dense
                outlined
                v-model="newCredential.platform"
                :options="platformOptions"
                label="Platform (Optional)"
                class="platform-select"
                clearable
                option-label="title"
                option-value="name"
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="category" class="input-icon" size="xs" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="platform-option">
                    <q-item-section avatar>
                      <div
                        class="platform-option-icon"
                        :style="{ backgroundColor: scope.opt.color }"
                      >
                        <q-icon :name="scope.opt.icon" color="white" size="18px" />
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ scope.opt.title }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <div class="row items-center no-wrap" v-if="scope.opt">
                    <div
                      class="selected-platform-icon"
                      :style="{ backgroundColor: scope.opt.color }"
                    >
                      <q-icon :name="scope.opt.icon" color="white" size="14px" />
                    </div>
                    <span class="q-ml-sm">{{ scope.opt.title }}</span>
                  </div>
                </template>
              </q-select>
            </div>

            <!-- Email -->
            <div class="form-field">
              <q-input
                dense
                outlined
                v-model="newCredential.email"
                :label="requireEmail ? 'Email *' : 'Email'"
                class="custom-input"
                :rules="requireEmail ? [(val) => !!val || 'Email is required'] : []"
                type="email"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" class="input-icon" size="xs" />
                </template>
              </q-input>
            </div>

            <!-- Username -->
            <div class="form-field">
              <q-input
                dense
                outlined
                v-model="newCredential.username"
                :label="requireUsername ? 'Username *' : 'Username'"
                class="custom-input"
                :rules="requireUsername ? [(val) => !!val || 'Username is required'] : []"
              >
                <template v-slot:prepend>
                  <q-icon name="person" class="input-icon" size="xs" />
                </template>
              </q-input>
            </div>

            <!-- Password -->
            <div class="form-field">
              <q-input
                dense
                outlined
                v-model="newCredential.password"
                label="Password *"
                class="custom-input"
                :type="showNewPassword ? 'text' : 'password'"
                :rules="[(val) => !!val || 'Password is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" class="input-icon" size="xs" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showNewPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer input-icon"
                    size="xs"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </q-input>
            </div>

            <!-- Field requirement toggles (for admin/debugging) -->
            <div v-if="showFieldOptions" class="field-options q-mt-md q-pt-md">
              <q-separator />
              <div class="text-caption q-mt-sm q-mb-xs text-grey-6">Field Requirements:</div>
              <div class="row q-gutter-sm">
                <q-toggle
                  v-model="requireEmail"
                  label="Email required"
                  size="xs"
                  dense
                  class="custom-toggle"
                />
                <q-toggle
                  v-model="requireUsername"
                  label="Username required"
                  size="xs"
                  dense
                  class="custom-toggle"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit Credential Dialog -->
    <q-dialog v-model="editDialogOpen" position="bottom">
      <q-card class="dialog-card">
        <q-toolbar class="custom-toolbar text-white mobile-toolbar">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-body1">Edit Credential</q-toolbar-title>
          <q-btn flat dense label="Update" @click="updateCredential" />
        </q-toolbar>

        <q-card-section class="q-pt-md q-px-sm">
          <q-form @submit="updateCredential" class="form-container">
            <!-- Platform Selection -->
            <div class="form-field">
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
                  <q-icon name="category" class="input-icon" size="xs" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon
                        :name="scope.opt.icon"
                        :style="{ color: scope.opt.color }"
                        size="20px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.title }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Email -->
            <div class="form-field">
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
                  <q-icon name="mail" class="input-icon" size="xs" />
                </template>
              </q-input>
            </div>

            <!-- Username -->
            <div class="form-field">
              <q-input
                dense
                outlined
                v-model="editingCredential.username"
                :label="requireUsername ? 'Username *' : 'Username'"
                class="custom-input"
                :rules="requireUsername ? [(val) => !!val || 'Username is required'] : []"
              >
                <template v-slot:prepend>
                  <q-icon name="person" class="input-icon" size="xs" />
                </template>
              </q-input>
            </div>

            <!-- Password -->
            <div class="form-field">
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
                  <q-icon name="vpn_key" class="input-icon" size="xs" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showEditPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer input-icon"
                    size="xs"
                    @click="showEditPassword = !showEditPassword"
                  />
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Keep all other dialogs as they were -->
    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-xs">
          <q-avatar icon="warning" color="negative" text-color="white" size="sm" />
          <span class="q-ml-sm text-body2">Delete Credential</span>
        </q-card-section>

        <q-card-section class="q-pt-none text-body2">
          Are you sure you want to delete "{{
            deleteCredential?.username || deleteCredential?.email || 'this credential'
          }}"?
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-py-xs">
          <q-btn flat dense label="Cancel" class="cancel-btn" v-close-popup />
          <q-btn
            flat
            dense
            label="Delete"
            color="negative"
            @click="deleteSelectedCredential"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

    <!-- Import Dialog -->
    <q-dialog v-model="importDialogOpen" position="bottom">
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1">Import Credentials</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-py-sm">
          <q-option-group
            v-model="importOption"
            :options="[
              { label: 'Import from CSV', value: 'csv' },
              { label: 'Import from Google', value: 'google' },
              { label: 'Import from LastPass', value: 'lastpass' },
              { label: 'Import from 1Password', value: '1password' },
            ]"
            class="custom-option-group"
            dense
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-sm q-py-xs">
          <q-btn flat class="continue-btn" label="Continue" size="sm" @click="continueImport" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePasswords } from 'src/composables/usePasswords'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { socMeds } from 'src/composables/usePlatforms'
import GenerateBtn from 'src/components/GenerateBtn.vue'

// State
const search = ref('')
const addDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const passwordDialogOpen = ref(false)
const showNewPassword = ref(false)
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

// New credential template
const newCredential = ref({
  platform: '',
  email: '',
  username: '',
  password: '',
  isVisible: false,
})

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

const addCredsFunc = async () => {
  if (!isFormValid()) return

  await addCredential(
    newCredential.value.email,
    newCredential.value.password,
    newCredential.value.username,
    newCredential.value.platform,
  )
  addDialogOpen.value = false
  resetNewCredential()
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
  resetNewCredential()
  addDialogOpen.value = true
}

const resetNewCredential = () => {
  newCredential.value = {
    platform: '',
    email: '',
    username: '',
    password: '',
    isVisible: false,
  }
  showNewPassword.value = false
}

const isFormValid = () => {
  if (!newCredential.value.password?.trim()) return false

  const hasEmail = newCredential.value.email?.trim()
  const hasUsername = newCredential.value.username?.trim()

  if (requireEmail.value && !hasEmail) return false
  if (requireUsername.value && !hasUsername) return false

  if (!requireEmail.value && !requireUsername.value) {
    return hasEmail || hasUsername
  }

  return true
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
  // Optional: You can add any additional logic when password is generated
  console.log('Password generated:', password)
}

const onPasswordCopied = (password) => {
  // Set the generated password to the new credential form
  newCredential.value.password = password
}

const openPasswordGenerator = () => {
  passwordGeneratorOpen.value = true
}

const openImportDialog = () => {
  importOption.value = 'csv'
  importDialogOpen.value = true
}

const continueImport = () => {
  importDialogOpen.value = false

  $q.notify({
    color: 'positive',
    position: 'top',
    message: `Import from ${importOption.value.toUpperCase()} started`,
    icon: 'cloud_download',
    timeout: 1500,
    textColor: 'white',
    classes: 'mobile-notification',
  })
}

onMounted(async () => {
  await loadCredentials()
})
</script>

<style scoped>
/* Enhanced styling with platform-aware colors */
.password-manager-app {
  background-color: #f1f5f9;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* Search Container Styling */
.search-container {
  background-color: #ffffff;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input {
  width: 100%;
  max-width: 100%;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px !important;
  border: 2px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  transition: all 0.2s ease;
}

.search-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1) !important;
  background-color: #ffffff !important;
}

.search-input :deep(.q-field__native) {
  padding: 12px 16px !important;
  font-size: 16px !important;
  color: #334155 !important;
}

.search-input :deep(.q-field__label) {
  color: #64748b !important;
  font-size: 16px !important;
}

.search-icon {
  color: #64748b !important;
  margin-left: 4px;
}

.content-container {
  flex: 1;
  padding: 8px 6px;
  width: 100%;
  margin: 0 auto;
}

/* Enhanced credential cards */
.credential-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 70px;
}

.credential-card {
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 12px;
  margin-bottom: 6px;
  border: 1px solid #e2e8f0 !important;
  background: white;
}

.credential-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #008080 !important;
}

/* Enhanced credential icon */
.credential-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.icon-letter {
  font-size: 16px;
  font-weight: 600;
}

.credential-details {
  margin: 0 12px;
  flex: 1;
  min-width: 0;
}

.credential-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 14px;
  color: #475569 !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-badge {
  background: rgba(0, 128, 128, 0.1);
  color: #008080 !important;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.credential-username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b !important;
  font-size: 12px;
}

.visibility-btn {
  color: #64748b !important;
}

.visibility-btn:hover {
  color: #008080 !important;
}

/* Enhanced Password Dialog */
.password-dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.dialog-header {
  color: white;
  padding: 20px;
}

.dialog-platform-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dialog-icon-letter {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dialog-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.password-section {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
  border-left: 3px solid #008080;
  padding: 12px;
  border-radius: 8px;
  margin: 0 16px;
  word-break: break-all;
}

.password-value {
  font-size: 16px;
  color: #008080 !important;
  line-height: 1.3;
  word-break: break-all;
}

/* Action buttons in dialog */
.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  flex: 1;
}

.action-button:hover {
  background-color: rgba(0, 128, 128, 0.1);
}

.action-icon-primary {
  color: #008080 !important;
}

.action-label {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 32px 24px;
  margin: 16px 0;
}

.empty-icon {
  color: #64748b !important;
}

.empty-text {
  color: #64748b !important;
}

.fab-container {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9;
}

.custom-fab {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  box-shadow: 0 8px 24px rgba(0, 128, 128, 0.3) !important;
  height: 55px;
  width: 55px;
  color: #e2e8f0 !important;
}

.fab-action-teal {
  background: #008080 !important;
  box-shadow: 0 4px 12px rgba(0, 128, 128, 0.3) !important;
}

.fab-action-blue {
  background: #1e3a8a !important;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3) !important;
}

.fab-action-orange {
  background: #fb923c !important;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3) !important;
}

/* Enhanced dialogs */
.dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 16px 16px 0 0;
}

.custom-toolbar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  min-height: 48px;
  padding: 8px 16px;
}

.mobile-toolbar {
  min-height: 48px;
  padding: 8px 16px;
}

/* Form Container and Field Spacing */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

/* Field options section */
.field-options {
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

/* Enhanced platform select */
.platform-select :deep(.q-field__control) {
  border-radius: 12px !important;
  border-color: #e2e8f0 !important;
  transition: all 0.3s ease;
}

.platform-select :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1) !important;
}

.platform-option {
  padding: 12px 16px !important;
}

.platform-option-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selected-platform-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form Styling */
.custom-input :deep(.q-field__control) {
  border-color: #e2e8f0 !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1) !important;
}

.custom-input :deep(.q-field__label) {
  color: #64748b !important;
}

.custom-input :deep(.q-field--focused .q-field__label) {
  color: #008080 !important;
}

.input-icon {
  color: #64748b !important;
}

.custom-input:focus-within .input-icon {
  color: #008080 !important;
}

/* Custom toggles and other form elements */
.custom-toggle :deep(.q-toggle__inner) {
  color: #008080 !important;
}

.continue-btn {
  color: #008080 !important;
}

.custom-option-group :deep(.q-radio__inner) {
  color: #008080 !important;
}

.cancel-btn {
  color: #64748b !important;
}

/* Responsive Design */
@media (max-width: 480px) {
  .credential-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .credential-title {
    font-size: 13px;
  }

  .credential-username {
    font-size: 11px;
  }

  .dialog-header {
    padding: 16px;
  }

  .dialog-platform-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
}
</style>
