<template>
  <q-page class="password-manager-app">
    <!-- Minimal Header -->
    <div class="app-header">
      <div class="app-title" @click="triggerSecret">
        <q-icon name="lock" size="20px" color="white" class="q-mr-xs" />
        <span class="text-weight-bold">S-Tea</span>
      </div>

      <!-- Search toggle in header -->
      <q-btn
        flat
        round
        dense
        color="white"
        icon="search"
        size="sm"
        @click="toggleSearch"
        aria-label="Toggle search"
      />
    </div>

    <!-- Search overlay - slides down when active -->
    <transition name="slide-down">
      <div v-if="showSearch" class="search-overlay">
        <q-input
          v-model="search"
          dense
          autofocus
          placeholder="Search credentials..."
          outlined
          class="search-input"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" size="16px" color="grey-7" />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              size="14px"
              color="grey-7"
              class="cursor-pointer"
              @click="toggleSearch"
            />
          </template>
        </q-input>
      </div>
    </transition>

    <!-- Main Content - optimized for small screens -->
    <div class="content-container">
      <div v-if="filteredCredentials.length === 0" class="empty-state">
        <q-icon name="search_off" size="28px" color="grey-5" />
        <div class="text-subtitle2 q-mt-xs">No matching credentials</div>
        <div class="text-caption q-mt-xs text-grey-7">Try adjusting your search</div>
      </div>

      <!-- Mobile-optimized credential list -->
      <div v-else class="credential-list">
        <q-card
          v-for="(credential, index) in filteredCredentials"
          :key="index"
          class="credential-card q-mb-xs"
          @click="showPasswordDialog(index)"
          flat
          bordered
        >
          <q-card-section class="q-pa-xs">
            <div class="row items-center no-wrap justify-between">
              <!-- Icon based on first letter of title -->
              <div class="credential-icon">
                {{ credential.title.charAt(0).toUpperCase() }}
              </div>

              <!-- Title and Username -->
              <div class="credential-details">
                <div class="text-subtitle2 credential-title">{{ credential.title }}</div>
                <div class="text-caption credential-username">{{ credential.username }}</div>
              </div>

              <!-- Visibility button -->
              <q-btn
                flat
                round
                dense
                color="grey-7"
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

    <!-- Password Dialog - NEW COMPONENT -->
    <q-dialog v-model="passwordDialogOpen" position="bottom">
      <q-card class="password-dialog-card">
        <q-card-section class="q-pb-none">
          <div class="text-center text-subtitle1 q-py-sm password-dialog-title">
            {{ activeCredential?.title }}
          </div>
          <q-separator />
        </q-card-section>

        <!-- Password Display Section -->
        <q-card-section class="q-py-sm">
          <div class="password-section">
            <div class="password-value text-monospace q-py-xs text-center">
              {{ activeCredential?.password }}
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Action Buttons -->
        <q-card-section class="row justify-around q-py-sm">
          <div class="action-button" @click="copyActivePassword">
            <q-icon name="content_copy" color="primary" size="24px" />
            <div class="action-label">Copy password</div>
          </div>

          <div class="action-button" @click="editActiveCredential">
            <q-icon name="edit" color="primary" size="24px" />
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
        color="primary"
        icon="add"
        direction="up"
        :size="$q.screen.lt.sm ? 'sm' : 'md'"
        padding="xs"
        :persistent="$q.screen.lt.sm"
      >
        <q-fab-action
          color="teal"
          icon="password"
          size="sm"
          padding="xs"
          label="Password Generator"
          external-label
          label-position="left"
          @click="openPasswordGenerator"
        />
        <q-fab-action
          color="blue"
          icon="cloud_download"
          size="sm"
          padding="xs"
          label="Import Credentials"
          external-label
          label-position="left"
          @click="openImportDialog"
        />
        <q-fab-action
          color="purple"
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

    <!-- Modals and Dialogs -->

    <!-- Add Credential Dialog -->
    <q-dialog v-model="addDialogOpen" position="bottom">
      <q-card class="dialog-card">
        <q-toolbar class="bg-primary text-white mobile-toolbar">
          <q-btn flat round dense icon="arrow_back" v-close-popup @click="resetNewCredential" />
          <q-toolbar-title class="text-body1">New Credential</q-toolbar-title>
          <q-btn flat dense label="Save" :disable="!isFormValid()" @click="addCredsFunc" />
        </q-toolbar>

        <q-card-section class="q-pt-md q-px-sm">
          <q-form @submit="addCredsFunc" class="q-gutter-sm">
            <!-- Title -->
            <q-input
              dense
              outlined
              v-model="newCredential.title"
              label="Title *"
              :rules="[(val) => !!val || 'Title is required']"
            >
              <template v-slot:prepend>
                <q-icon name="label" color="grey-7" size="xs" />
              </template>
            </q-input>

            <!-- Username -->
            <q-input
              dense
              outlined
              v-model="newCredential.username"
              label="Username/Email *"
              :rules="[(val) => !!val || 'Username is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="grey-7" size="xs" />
              </template>
            </q-input>

            <!-- Password -->
            <q-input
              dense
              outlined
              v-model="newCredential.password"
              label="Password *"
              :type="showNewPassword ? 'text' : 'password'"
              :rules="[(val) => !!val || 'Password is required']"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" color="grey-7" size="xs" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showNewPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  size="xs"
                  @click="showNewPassword = !showNewPassword"
                />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Edit Credential Dialog -->
    <q-dialog v-model="editDialogOpen" position="bottom">
      <q-card class="dialog-card">
        <q-toolbar class="bg-primary text-white mobile-toolbar">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-body1">Edit Credential</q-toolbar-title>
          <q-btn flat dense label="Update" @click="updateCredential" />
        </q-toolbar>

        <q-card-section class="q-pt-md q-px-sm">
          <q-form @submit="updateCredential" class="q-gutter-sm">
            <!-- Title -->
            <q-input
              dense
              outlined
              v-model="editingCredential.title"
              label="Title *"
              :rules="[(val) => !!val || 'Title is required']"
            >
              <template v-slot:prepend>
                <q-icon name="label" color="grey-7" size="xs" />
              </template>
            </q-input>

            <!-- Username -->
            <q-input
              dense
              outlined
              v-model="editingCredential.username"
              label="Username/Email *"
              :rules="[(val) => !!val || 'Username is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="grey-7" size="xs" />
              </template>
            </q-input>

            <!-- Password -->
            <q-input
              dense
              outlined
              v-model="editingCredential.password"
              label="Password *"
              :type="showEditPassword ? 'text' : 'password'"
              :rules="[(val) => !!val || 'Password is required']"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" color="grey-7" size="xs" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showEditPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  size="xs"
                  @click="showEditPassword = !showEditPassword"
                />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-xs">
          <q-avatar icon="warning" color="negative" text-color="white" size="sm" />
          <span class="q-ml-sm text-body2">Delete Credential</span>
        </q-card-section>

        <q-card-section class="q-pt-none text-body2">
          Are you sure you want to delete "{{ deleteCredential?.title }}"?
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-py-xs">
          <q-btn flat dense label="Cancel" color="grey-7" v-close-popup />
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

    <!-- Password Generator Dialog -->
    <q-dialog v-model="passwordGeneratorOpen" position="bottom">
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1">Password Generator</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-py-sm">
          <div class="generated-password">
            {{ generatedPassword }}
          </div>

          <div class="password-options q-mt-sm">
            <q-toggle dense v-model="passwordOptions.uppercase" label="A-Z" />
            <q-toggle dense v-model="passwordOptions.lowercase" label="a-z" />
            <q-toggle dense v-model="passwordOptions.numbers" label="0-9" />
            <q-toggle dense v-model="passwordOptions.symbols" label="#$@!" />
          </div>

          <q-slider
            v-model="passwordOptions.length"
            :min="8"
            :max="32"
            label
            label-always
            color="primary"
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="between" class="q-px-sm q-py-xs">
          <q-btn
            flat
            color="primary"
            icon="refresh"
            label="Generate"
            size="sm"
            @click="generatePassword"
          />
          <q-btn
            flat
            color="primary"
            icon="content_copy"
            label="Copy"
            size="sm"
            @click="copyGeneratedPassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
            color="primary"
            dense
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-sm q-py-xs">
          <q-btn flat color="primary" label="Continue" size="sm" @click="continueImport" />
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

// State
const search = ref('')
const showSearch = ref(false)
const addDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const passwordDialogOpen = ref(false) // New state for password dialog
const showNewPassword = ref(false)
const showEditPassword = ref(false)
const passwordGeneratorOpen = ref(false)
const importDialogOpen = ref(false)
const $q = useQuasar()
const { addCredential, getCredentials, error, loading } = usePasswords()
const secretCount = ref(0)
let secretTimeout = null
const router = useRouter()

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

const triggerSecret = () => {
  secretCount.value++
  console.log(secretCount.value)
  if (secretTimeout) clearTimeout(secretTimeout)

  // Reset after 1.2 seconds
  secretTimeout = setTimeout(() => {
    secretCount.value = 0
  }, 1200)

  if (secretCount.value >= 5) {
    secretCount.value = 0
    goToSecret()
  }
}

const goToSecret = () => {
  console.log('Attempting to navigate to secret page...')

  try {
    // Try named route first
    router
      .push({ name: 'secret' })
      .then(() => {
        console.log('Navigation successful via named route')
      })
      .catch((error) => {
        console.error('Named route failed:', error)
        // Fallback to path-based navigation
        router
          .push('/secret')
          .then(() => {
            console.log('Navigation successful via path')
          })
          .catch((pathError) => {
            console.error('Path-based navigation also failed:', pathError)
            // Last resort - manual navigation
            window.location.href = '/secret'
          })
      })
  } catch (error) {
    console.error('Navigation error:', error)
    // Direct path fallback
    router.push('/secret')
  }
}

// Active credential for dialog
const activeCredential = ref(null)

// Initial credentials
const credentials = ref([])
const editingCredential = ref({
  title: '',
  username: '',
  password: '',
  isVisible: false,
  index: -1,
})
const deleteCredential = ref(null)

const loadCredentials = async () => {
  const response = await getCredentials()
  credentials.value = response
}

// New credential template
const newCredential = ref({
  title: '',
  username: '',
  password: '',
  isVisible: false,
})

const addCredsFunc = async () => {
  if (!isFormValid()) return

  await addCredential(
    newCredential.value.username,
    newCredential.value.password,
    newCredential.value.title,
  )
  addDialogOpen.value = false
  resetNewCredential()
  await loadCredentials() // Reload credentials after adding
}

// Computed property for filtered credentials
const filteredCredentials = computed(() => {
  const searchTerm = search.value.toLowerCase().trim()
  if (!searchTerm) return credentials.value

  return credentials.value.filter(
    (cred) =>
      cred.title.toLowerCase().includes(searchTerm) ||
      cred.username.toLowerCase().includes(searchTerm),
  )
})

// Toggle search visibility
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value === false) {
    search.value = '' // Clear search when hiding
  }
}

// New method to show password in dialog
const showPasswordDialog = (index) => {
  if (index < 0 || index >= credentials.value.length) return

  // Set the active credential
  activeCredential.value = credentials.value[index]

  // Show the password dialog
  passwordDialogOpen.value = true
}

// Helper to find the original index of a credential
const findCredentialIndex = (credential) => {
  return credentials.value.findIndex(
    (c) =>
      c.title === credential.title &&
      c.username === credential.username &&
      c.password === credential.password,
  )
}

const openAddDialog = () => {
  resetNewCredential()
  addDialogOpen.value = true
}

const resetNewCredential = () => {
  newCredential.value = {
    title: '',
    username: '',
    password: '',
    isVisible: false,
  }
  showNewPassword.value = false
}

const isFormValid = () => {
  return (
    newCredential.value.title.trim() !== '' &&
    newCredential.value.username.trim() !== '' &&
    newCredential.value.password.trim() !== ''
  )
}

const copyPassword = (password) => {
  // Use the Clipboard API to actually copy the password
  navigator.clipboard
    .writeText(password)
    .then(() => {
      // Close the password dialog
      passwordDialogOpen.value = false

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Password copied to clipboard',
        icon: 'check',
      })
    })
    .catch((err) => {
      // Handle errors (e.g., clipboard permissions denied)
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
  if (activeCredential.value) {
    copyPassword(activeCredential.value.password)
  }
}

const editActiveCredential = () => {
  if (activeCredential.value) {
    const index = findCredentialIndex(activeCredential.value)
    editCredential(index)
    // Close the password dialog when editing
    passwordDialogOpen.value = false
  }
}

const confirmDeleteActive = () => {
  if (activeCredential.value) {
    const index = findCredentialIndex(activeCredential.value)
    confirmDelete(index)
    // Close the password dialog when deleting
    passwordDialogOpen.value = false
  }
}

// Added methods for new functionality
const editCredential = (index) => {
  const credential = credentials.value[index]
  editingCredential.value = {
    title: credential.title,
    username: credential.username,
    password: credential.password,
    isVisible: credential.isVisible,
    index: index,
  }
  showEditPassword.value = false
  editDialogOpen.value = true
}

const updateCredential = () => {
  const index = editingCredential.value.index
  if (index >= 0 && index < credentials.value.length) {
    credentials.value[index].title = editingCredential.value.title
    credentials.value[index].username = editingCredential.value.username
    credentials.value[index].password = editingCredential.value.password
    // In a real app, you would call an API to update the credential
  }
  editDialogOpen.value = false
}

const confirmDelete = (index) => {
  deleteCredential.value = credentials.value[index]
  deleteDialogOpen.value = true
}

const deleteSelectedCredential = () => {
  const index = findCredentialIndex(deleteCredential.value)
  if (index >= 0) {
    credentials.value.splice(index, 1)
    // In a real app, you would call an API to delete the credential
  }
  deleteCredential.value = null
}

// Password generator
const generatePassword = () => {
  const options = passwordOptions.value

  // Characters pools based on options
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?'

  let chars = ''
  if (options.uppercase) chars += uppercaseChars
  if (options.lowercase) chars += lowercaseChars
  if (options.numbers) chars += numberChars
  if (options.symbols) chars += symbolChars

  // Default to lowercase if nothing selected
  if (!chars) chars = lowercaseChars

  // Generate random password
  let password = ''
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    password += chars[randomIndex]
  }

  generatedPassword.value = password
}

const copyGeneratedPassword = () => {
  // In real app, copy to clipboard
  newCredential.value.password = generatedPassword.value
  copyPassword(generatedPassword.value)
  passwordGeneratorOpen.value = false
}

const openPasswordGenerator = () => {
  generatePassword() // Generate a new password when opening
  passwordGeneratorOpen.value = true
}

const openImportDialog = () => {
  importOption.value = 'csv'
  importDialogOpen.value = true
}

const continueImport = () => {
  // In a real app, this would implement the actual import functionality
  importDialogOpen.value = false

  // Show success notification
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
.password-manager-app {
  background-color: #f8f9fa;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.app-header {
  background-color: #1976d2;
  color: white;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 48px;
}

.app-title {
  display: flex;
  align-items: center;
  font-size: 16px;
}

/* Search overlay animation */
.search-overlay {
  background-color: #1976d2;
  padding: 0 10px 6px 10px;
  z-index: 9;
  position: absolute;
  left: 0;
  right: 0;
  top: 48px; /* Header height */
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
}

.search-input {
  width: 100%;
  border-radius: 4px;
}

.content-container {
  flex: 1;
  padding: 8px 6px;
  width: 100%;
  margin: 0 auto;
}

/* Vertical credential list for smallest screens */
.credential-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 70px; /* Space for FAB */
}

.credential-card {
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 6px; /* Added space between cards */
}

.credential-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.credential-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.credential-details {
  margin: 0 6px;
  flex: 1;
  min-width: 0;
}

.credential-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 13px; /* Smaller for mobile */
}

.credential-username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(0, 0, 0, 0.6);
  font-size: 11px; /* Smaller for mobile */
}

/* Password Dialog Styles */
.password-dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 12px 12px 0 0;
}

.password-dialog-title {
  font-weight: 500;
  padding: 12px 0 8px 0;
}

.password-section {
  background-color: #f0f9ff;
  border-left: 2px solid #42a5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 0 8px;
  word-break: break-all;
}

.password-value {
  font-size: 16px;
  color: #1976d2;
  line-height: 1.3;
  word-break: break-all;
}

/* Action buttons in dialog */
.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-label {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 16px 12px;
  margin: 8px 0;
}

.fab-container {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 9;
}

/* Mobile-optimized dialogs */
.dialog-card {
  width: 100%;
  max-width: 100%; /* Full width on mobile */
  border-radius: 12px 12px 0 0; /* Rounded top corners only */
}

.mobile-toolbar {
  min-height: 40px; /* Smaller toolbar height */
  padding: 4px 8px;
}

/* Password Generator */
.generated-password {
  font-family: monospace;
  font-size: 14px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  overflow-wrap: break-word;
  border: 1px solid #e0e0e0;
}

.password-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

/* Smaller notification */
.notification-card {
  border-radius: 4px;
  min-width: auto;
  max-width: 250px;
}

.mobile-notification {
  font-size: 13px !important;
}

/* Extra small screen optimizations */
@media (max-width: 360px) {
  .app-header {
    padding: 4px 8px;
    height: 44px;
  }

  .app-title {
    font-size: 15px;
  }

  .content-container {
    padding: 6px 4px;
  }

  .credential-icon {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .credential-title {
    font-size: 12px;
  }

  .credential-username {
    font-size: 10px;
  }

  .action-button {
    padding: 6px 8px;
  }

  .action-label {
    font-size: 11px;
  }

  .password-value {
    font-size: 14px;
  }

  .dialog-card {
    width: 100vw; /* Full viewport width */
  }
}
</style>
