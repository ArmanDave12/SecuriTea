<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <transition name="dialog-content" appear>
      <q-card class="dialog-card">
        <q-card-section class="import-header">
          <div class="import-title">
            <q-icon name="cloud_upload" class="title-icon" size="24px" />
            Import/Export Credentials
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- CSV Import Section -->
        <q-card-section class="import-content">
          <!-- File Upload Area -->
          <div
            class="upload-area"
            :class="{ 'drag-over': dragOver, 'has-file': selectedFile }"
            @drop="handleDrop"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              @change="handleFileSelect"
              style="display: none"
            />

            <transition name="upload-content" mode="out-in">
              <div v-if="!selectedFile" key="no-file" class="upload-placeholder">
                <div class="upload-icon-wrapper">
                  <q-icon name="upload_file" class="upload-icon" size="48px" />
                  <div class="icon-pulse"></div>
                </div>
                <div class="upload-text">
                  <div class="upload-primary">Drop your CSV file here</div>
                  <div class="upload-secondary">or click to browse</div>
                </div>
              </div>

              <div v-else key="has-file" class="file-selected">
                <div class="file-icon-wrapper">
                  <q-icon name="description" class="file-icon" size="32px" />
                  <div class="success-checkmark">
                    <q-icon name="check_circle" size="16px" />
                  </div>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ selectedFile.name }}</div>
                  <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  class="remove-file-btn"
                  @click.stop="removeFile"
                />
              </div>
            </transition>
          </div>

          <!-- Import Progress -->
          <transition name="progress-slide">
            <div v-if="importing" class="import-progress">
              <div class="progress-header">
                <q-icon name="sync" class="spinning-icon" size="20px" />
                <span class="progress-text">Importing credentials...</span>
              </div>
              <q-linear-progress
                :value="importProgress"
                color="teal"
                class="progress-bar"
                animation-speed="200"
              />
              <div class="progress-stats">
                {{ importedCount }} of {{ totalCount }} credentials imported
              </div>
            </div>
          </transition>

          <!-- Export Progress -->
          <transition name="progress-slide">
            <div v-if="exporting" class="import-progress">
              <div class="progress-header">
                <q-icon name="download" class="spinning-icon" size="20px" />
                <span class="progress-text">Exporting credentials...</span>
              </div>
              <q-linear-progress
                :value="exportProgress"
                color="orange"
                class="progress-bar"
                animation-speed="200"
              />
              <div class="progress-stats">Preparing CSV export...</div>
            </div>
          </transition>

          <!-- Success Animation -->
          <transition name="success-bounce">
            <div v-if="importSuccess" class="import-success">
              <div class="success-icon-wrapper">
                <q-icon name="check_circle" class="success-icon" size="48px" />
                <div class="success-ripple"></div>
              </div>
              <div class="success-text">
                <div class="success-primary">Import Completed!</div>
                <div class="success-secondary">
                  {{ importedCount }} credentials imported successfully
                </div>
              </div>
            </div>
          </transition>

          <!-- Export Success Animation -->
          <transition name="success-bounce">
            <div v-if="exportSuccess" class="import-success">
              <div class="success-icon-wrapper">
                <q-icon name="download_done" class="success-icon" size="48px" />
                <div class="success-ripple"></div>
              </div>
              <div class="success-text">
                <div class="success-primary">Export Completed!</div>
                <div class="success-secondary">
                  {{ exportedCount }} credentials exported successfully
                </div>
              </div>
            </div>
          </transition>
        </q-card-section>

        <q-card-actions class="import-actions">
          <q-btn
            flat
            class="download-template-btn"
            label="Download Template"
            icon="download"
            @click="downloadTemplate"
            :loading="downloadingTemplate"
          />
          <div class="action-buttons">
            <q-btn
              flat
              class="import-btn"
              label="Import CSV"
              icon="cloud_upload"
              :disable="!selectedFile || importing || exporting"
              :loading="importing"
              @click="handleImport"
            />
            <q-btn
              flat
              class="export-btn"
              label="Export CSV"
              icon="cloud_download"
              :disable="importing || exporting"
              :loading="exporting"
              @click="handleExport"
            />
          </div>
        </q-card-actions>
      </q-card>
    </transition>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  credentials: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'import-complete', 'export-complete'])

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const dragOver = ref(false)
const importing = ref(false)
const exporting = ref(false)
const importProgress = ref(0)
const exportProgress = ref(0)
const importedCount = ref(0)
const exportedCount = ref(0)
const totalCount = ref(0)
const importSuccess = ref(false)
const exportSuccess = ref(false)
const downloadingTemplate = ref(false)

// Methods
const triggerFileInput = () => {
  if (!importing.value && !exporting.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'text/csv') {
    selectedFile.value = file
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  dragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  const csvFile = files.find((file) => file.type === 'text/csv' || file.name.endsWith('.csv'))

  if (csvFile) {
    selectedFile.value = csvFile
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadTemplate = async () => {
  downloadingTemplate.value = true

  // Simulate download delay for animation
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Create CSV template
  const csvContent =
    'username,email,password,platform\nexample_user,example@email.com,mypassword123,facebook\n'
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'credentials-template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)

  downloadingTemplate.value = false
}

const parseCSV = (text) => {
  const lines = text.split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const credentials = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',')
    const credential = {}

    headers.forEach((header, index) => {
      credential[header] = values[index]?.trim() || ''
    })

    if (credential.username || credential.email) {
      credentials.push(credential)
    }
  }

  return credentials
}

const handleImport = async () => {
  if (!selectedFile.value) return

  importing.value = true
  importProgress.value = 0
  importedCount.value = 0
  importSuccess.value = false
  exportSuccess.value = false

  try {
    // Read file content
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(selectedFile.value)
    })

    // Parse CSV
    const credentials = parseCSV(text)
    totalCount.value = credentials.length

    // Simulate import process with progress
    for (let i = 0; i < credentials.length; i++) {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 200))

      importedCount.value = i + 1
      importProgress.value = (i + 1) / credentials.length
    }

    // Show success state
    importSuccess.value = true

    // Emit completion event
    emit('import-complete', {
      credentials,
      count: credentials.length,
    })

    // Auto close after success
    setTimeout(() => {
      emit('update:modelValue', false)
    }, 3000)
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    importing.value = false
  }
}

const handleExport = async () => {
  exporting.value = true
  exportProgress.value = 0
  exportedCount.value = 0
  exportSuccess.value = false
  importSuccess.value = false

  try {
    // Simulate export preparation
    exportProgress.value = 0.2
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Get credentials from parent component or use props
    const credentialsToExport = props.credentials || []
    exportedCount.value = credentialsToExport.length

    exportProgress.value = 0.5
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Create CSV content
    const headers = ['username', 'email', 'password', 'platform']
    let csvContent = headers.join(',') + '\n'

    credentialsToExport.forEach((credential) => {
      const row = [
        credential.username || '',
        credential.email || '',
        credential.password || '',
        credential.platform || '',
      ]
      // Escape commas and quotes in data
      const escapedRow = row.map((field) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return '"' + field.replace(/"/g, '""') + '"'
        }
        return field
      })
      csvContent += escapedRow.join(',') + '\n'
    })

    exportProgress.value = 0.8
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `credentials-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    exportProgress.value = 1
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Show success state
    exportSuccess.value = true

    // Emit export completion event
    emit('export-complete', {
      count: exportedCount.value,
    })

    // Auto close after success
    setTimeout(() => {
      emit('update:modelValue', false)
    }, 3000)
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    exporting.value = false
  }
}

// Reset state when dialog opens/closes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Reset state when opening
      selectedFile.value = null
      importing.value = false
      exporting.value = false
      importProgress.value = 0
      exportProgress.value = 0
      importedCount.value = 0
      exportedCount.value = 0
      totalCount.value = 0
      importSuccess.value = false
      exportSuccess.value = false
      dragOver.value = false
    }
  },
)
</script>

<style scoped>
/* Enhanced page transitions */
.dialog-content-enter-active {
  animation: dialogSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.upload-content-enter-active,
.upload-content-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.upload-content-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.upload-content-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.progress-slide-enter-active {
  animation: progressSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.progress-slide-leave-active {
  animation: progressSlideOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.success-bounce-enter-active {
  animation: successBounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Keyframes for transitions */
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

@keyframes progressSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
    max-height: 0;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    max-height: 120px;
  }
}

@keyframes progressSlideOut {
  0% {
    opacity: 1;
    transform: translateY(0);
    max-height: 120px;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
    max-height: 0;
  }
}

@keyframes successBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes iconPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes successRipple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Enhanced dialogs */
.dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* Import header styling */
.import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px !important;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 128, 128, 0.02) 100%);
  border-bottom: 1px solid rgba(0, 128, 128, 0.1);
}

.import-title {
  font-size: 18px;
  font-weight: 700;
  color: #475569 !important;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #008080 !important;
}

/* Import content */
.import-content {
  padding: 24px !important;
}

/* Upload area styling */
.upload-area {
  border: 2px dashed rgba(0, 128, 128, 0.3);
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.02) 0%, rgba(0, 128, 128, 0.05) 100%);
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: rgba(0, 128, 128, 0.5);
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 128, 128, 0.12) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 128, 128, 0.15);
}

.upload-area.drag-over {
  border-color: #008080;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.15) 0%, rgba(0, 128, 128, 0.2) 100%);
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 128, 128, 0.25);
}

.upload-area.has-file {
  border-color: rgba(16, 185, 129, 0.5);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%);
}

/* Upload placeholder */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon-wrapper {
  position: relative;
}

.upload-icon {
  color: #008080 !important;
}

.icon-pulse {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(0, 128, 128, 0.3);
  border-radius: 50%;
  animation: iconPulse 2s infinite ease-in-out;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-primary {
  font-size: 16px;
  font-weight: 600;
  color: #475569 !important;
}

.upload-secondary {
  font-size: 14px;
  color: #64748b !important;
}

/* File selected state */
.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-icon-wrapper {
  position: relative;
  padding: 12px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%);
  border-radius: 12px;
}

.file-icon {
  color: #10b981 !important;
}

.success-checkmark {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #10b981;
  border-radius: 50%;
  padding: 2px;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #475569 !important;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #64748b !important;
}

.remove-file-btn {
  color: #64748b !important;
  transition: all 0.3s ease;
}

.remove-file-btn:hover {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
  transform: scale(1.1);
}

/* Import progress */
.import-progress {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 128, 128, 0.08) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 128, 128, 0.15);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.spinning-icon {
  color: #008080 !important;
  animation: spin 1s linear infinite;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569 !important;
}

.progress-bar {
  margin-bottom: 8px;
  border-radius: 4px;
  height: 6px;
}

.progress-stats {
  font-size: 12px;
  color: #64748b !important;
  text-align: center;
}

/* Import success */
.import-success {
  margin-top: 24px;
  padding: 24px;
  text-align: center;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.success-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.success-icon {
  color: #10b981 !important;
}

.success-ripple {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(16, 185, 129, 0.4);
  border-radius: 50%;
  animation: successRipple 2s infinite ease-out;
}

.success-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.success-primary {
  font-size: 16px;
  font-weight: 700;
  color: #10b981 !important;
}

.success-secondary {
  font-size: 14px;
  color: #475569 !important;
}

/* Action buttons */
.import-actions {
  padding: 16px 24px !important;
  justify-content: space-between;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.download-template-btn {
  color: #64748b !important;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
}

.download-template-btn:hover {
  background: rgba(100, 116, 139, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
}

.import-btn {
  color: #008080 !important;
  background: rgba(0, 128, 128, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
}

.import-btn:hover:not(:disabled) {
  background: rgba(0, 128, 128, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 128, 128, 0.2);
}

.export-btn {
  color: #f97316 !important;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 600;
}

.export-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.import-btn:disabled,
.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 480px) {
  .import-header {
    padding: 16px 20px 12px !important;
  }

  .import-title {
    font-size: 16px;
  }

  .import-content {
    padding: 20px !important;
  }

  .upload-area {
    padding: 32px 20px;
  }

  .import-actions {
    padding: 12px 20px !important;
    flex-direction: column;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .file-selected {
    padding: 12px;
    gap: 12px;
  }
}

/* Dark mode enhancements */
.body--dark .import-title {
  color: #e5e7eb !important;
}

.body--dark .title-icon {
  color: #10b981 !important;
}

.body--dark .import-header {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-bottom-color: rgba(16, 185, 129, 0.15);
}

.body--dark .upload-area {
  border-color: rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.08) 100%);
}

.body--dark .upload-area:hover {
  border-color: rgba(16, 185, 129, 0.6);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.15) 100%);
}

.body--dark .upload-area.drag-over {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.25) 100%);
}

.body--dark .upload-primary {
  color: #e5e7eb !important;
}

.body--dark .upload-secondary {
  color: #94a3b8 !important;
}

.body--dark .upload-icon {
  color: #10b981 !important;
}

.body--dark .icon-pulse {
  border-color: rgba(16, 185, 129, 0.4);
}

.body--dark .file-selected {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
}

.body--dark .file-name {
  color: #e5e7eb !important;
}

.body--dark .file-size {
  color: #94a3b8 !important;
}

.body--dark .progress-text {
  color: #e5e7eb !important;
}

.body--dark .progress-stats {
  color: #94a3b8 !important;
}

.body--dark .success-primary {
  color: #10b981 !important;
}

.body--dark .success-secondary {
  color: #e5e7eb !important;
}

.body--dark .download-template-btn {
  color: #94a3b8 !important;
  background: rgba(148, 163, 184, 0.1);
}

.body--dark .download-template-btn:hover {
  background: rgba(148, 163, 184, 0.15);
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.2);
}

.body--dark .import-btn {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1);
}

.body--dark .import-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.15);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.body--dark .export-btn {
  color: #fb923c !important;
  background: rgba(251, 146, 60, 0.1);
}

.body--dark .export-btn:hover:not(:disabled) {
  background: rgba(251, 146, 60, 0.15);
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.2);
}
</style>
