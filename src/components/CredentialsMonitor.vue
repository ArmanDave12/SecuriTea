<template>
  <div class="monitor-container">
    <div class="monitor-screen">
      <!-- Monitor Header -->
      <div class="monitor-header">
        <div class="monitor-controls">
          <div class="control-dot red"></div>
          <div class="control-dot yellow"></div>
          <div class="control-dot green"></div>
        </div>
        //
        <div class="monitor-title">FIREBASE DATABASE CONSOLE</div>
        <div class="monitor-info">
          <span class="connection-status" :class="{ connected: isConnected }">
            {{ isConnected ? 'CONNECTED' : 'DISCONNECTED' }}
          </span>
        </div>
      </div>

      <!-- Monitor Content -->
      <div class="monitor-content">
        <div class="console-header">
          <div class="console-line">
            <!-- <span class="prompt">$</span> -->
            <!-- <span class="command">firebase-console --list-credentials</span> -->
          </div>
          <div class="console-line info">
            <span class="timestamp">{{ currentTime }}</span>
            <span class="separator">|</span>
            <span class="status">{{
              loading ? 'LOADING...' : `${credentials.length} RECORDS FOUND`
            }}</span>
          </div>
        </div>

        <!-- Loading Animation -->
        <div v-if="loading" class="loading-animation">
          <div class="loading-line">
            <span class="loading-text">Connecting to Firebase Database</span>
            <span class="loading-dots">{{ loadingDots }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${loadingProgress}%` }"></div>
          </div>
        </div>

        <!-- Credentials List -->
        <div v-else class="credentials-list">
          <div v-if="credentials.length === 0" class="empty-state">
            <div class="console-line error">
              <span class="prompt">!</span>
              <span class="message">No credentials found in database</span>
            </div>
            <div class="console-line">
              <span class="prompt">$</span>
              <span class="command">Status: Database empty or connection failed</span>
            </div>
          </div>

          <div v-else>
            <!-- Data Header -->
            <div class="data-header">
              <!-- <div class="console-line success">
                <span class="prompt">✓</span>
                <span class="message">Database scan completed successfully</span>
              </div> -->
              <div class="table-header">
                <span class="col-email">EMAIL</span>
                <span class="col-password">PASSWORD</span>
                <span class="col-platform">PLATFORM</span>
                <span class="col-created">CREATED</span>
              </div>
            </div>

            <!-- Credentials Data with Animation -->
            <div class="credentials-data">
              <div
                v-for="(cred, index) in displayedCredentials"
                :key="cred.id"
                class="credential-row"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <span class="col-email">{{ cred.email || 'N/A' }}</span>
                <span class="col-password">{{ formatPassword(cred.password) }}</span>
                <span class="col-platform">{{ cred.platform || 'UNKNOWN' }}</span>
                <span class="col-created">{{ formatDate(cred.createdAt) }}</span>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="credentials.length > itemsPerPage" class="pagination-controls">
              <!-- <div class="console-line">
                <span class="prompt">$</span>
                <span class="command">
                  Page {{ currentPage }} of {{ totalPages }} ({{ startIndex + 1 }}-{{ endIndex }} of
                  {{ credentials.length }})
                </span>
              </div> -->
              <div class="pagination-buttons">
                <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
                  ← PREV
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
                  NEXT →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monitor Footer -->
      <div class="monitor-footer">
        <div class="footer-left">
          <button @click="refreshData" class="refresh-btn" :disabled="loading">
            <q-icon :name="loading ? 'sync' : 'refresh'" :class="{ rotating: loading }" />
            {{ loading ? 'LOADING...' : 'REFRESH' }}
          </button>
        </div>
        <div class="footer-right">
          <button @click="toggleFullscreen" class="fullscreen-btn">
            <q-icon :name="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" />
            {{ isFullscreen ? 'EXIT' : 'EXPAND' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePasswords } from 'src/composables/usePasswords'

const { getCredsInFirebase } = usePasswords()

// Props
const props = defineProps({
  getAllCredentials: {
    type: Boolean,
    default: false,
  },
})

// Reactive data
const credentials = ref([])
const loading = ref(false)
const isConnected = ref(false)
const currentTime = ref('')
const loadingProgress = ref(0)
const loadingDots = ref('')
const isFullscreen = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Loading animation
let loadingInterval = null
let dotsInterval = null

// Computed properties
const displayedCredentials = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return credentials.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(credentials.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, credentials.value.length)
})

const uniqueUsers = computed(() => {
  const users = new Set(credentials.value.map((c) => c.userId))
  return users.size
})

const uniquePlatforms = computed(() => {
  const platforms = new Set(credentials.value.map((c) => c.platform).filter((p) => p))
  return platforms.size
})

const lastUpdated = computed(() => {
  if (credentials.value.length === 0) return 'N/A'
  const latest = Math.max(...credentials.value.map((c) => new Date(c.createdAt || 0).getTime()))
  return formatDate(new Date(latest))
})

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const startLoadingAnimation = () => {
  loadingProgress.value = 0
  loadingDots.value = ''

  // Progress animation
  loadingInterval = setInterval(() => {
    if (loadingProgress.value < 95) {
      loadingProgress.value += Math.random() * 15
    }
  }, 200)

  // Dots animation
  dotsInterval = setInterval(() => {
    if (loadingDots.value.length >= 3) {
      loadingDots.value = ''
    } else {
      loadingDots.value += '.'
    }
  }, 500)
}

const stopLoadingAnimation = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval)
    loadingInterval = null
  }
  if (dotsInterval) {
    clearInterval(dotsInterval)
    dotsInterval = null
  }
  loadingProgress.value = 100
  setTimeout(() => {
    loadingProgress.value = 0
    loadingDots.value = ''
  }, 300)
}

const refreshData = async () => {
  if (loading.value) return

  loading.value = true
  isConnected.value = false
  startLoadingAnimation()

  try {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const data = await getCredsInFirebase(props.getAllCredentials)
    credentials.value = data || []
    isConnected.value = true
    currentPage.value = 1
  } catch (error) {
    console.error('Failed to fetch credentials:', error)
    credentials.value = []
    isConnected.value = false
  } finally {
    stopLoadingAnimation()
    loading.value = false
  }
}

const formatPassword = (password) => {
  if (!password) return 'N/A'
  // Show the actual password without masking
  return password
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'INVALID'
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  })
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.querySelector('.monitor-container').requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// Lifecycle
onMounted(() => {
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)
  refreshData()

  onUnmounted(() => {
    clearInterval(timeInterval)
    stopLoadingAnimation()
  })
})
</script>

<style scoped>
.monitor-container {
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #1f2937;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.monitor-screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
}

/* Monitor Header */
.monitor-header {
  background: #374151;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #4b5563;
  min-height: 40px;
}

.monitor-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.control-dot.red {
  background: #ef4444;
}
.control-dot.yellow {
  background: #f59e0b;
}
.control-dot.green {
  background: #10b981;
}

.monitor-title {
  color: #e5e7eb;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.connection-status {
  color: #ef4444;
  font-size: 10px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.connection-status.connected {
  color: #10b981;
}

/* Monitor Content */
.monitor-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #111827;
  color: #10b981;
}

.console-header {
  margin-bottom: 16px;
}

.console-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  color: #10b981;
}

.console-line.info {
  color: #60a5fa;
}
.console-line.success {
  color: #10b981;
}
.console-line.error {
  color: #ef4444;
}

.prompt {
  color: #fbbf24;
  font-weight: 600;
  min-width: 12px;
}

.command {
  color: #e5e7eb;
}

.timestamp {
  color: #6b7280;
  font-size: 10px;
}

.separator {
  color: #4b5563;
}

.status {
  color: #60a5fa;
  font-weight: 600;
}

/* Loading Animation */
.loading-animation {
  text-align: center;
  padding: 40px 0;
}

.loading-line {
  margin-bottom: 16px;
}

.loading-text {
  color: #60a5fa;
  margin-right: 8px;
}

.loading-dots {
  color: #10b981;
  font-weight: bold;
  min-width: 20px;
  display: inline-block;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #374151;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #60a5fa);
  transition: width 0.3s ease;
  border-radius: 2px;
}

/* Credentials List */
.data-header {
  margin-bottom: 12px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  gap: 8px;
  padding: 8px 4px;
  background: #1f2937;
  border-radius: 4px;
  color: #fbbf24;
  font-weight: 600;
  font-size: 10px;
  margin-top: 8px;
}

.credentials-data {
  max-height: 280px;
  overflow-y: auto;
}

.credential-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid #374151;
  color: #e5e7eb;
  font-size: 10px;
  animation: slideIn 0.3s ease forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.credential-row:hover {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.col-email {
  color: #10b981;
}
.col-password {
  color: #f59e0b;
  font-family: 'Courier New', monospace;
}
.col-platform {
  color: #60a5fa;
}
.col-created {
  color: #6b7280;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

/* Pagination */
.pagination-controls {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #374151;
}

.pagination-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.page-btn {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #60a5fa;
  color: #60a5fa;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Footer Stats */
.footer-stats {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 4px;
  font-size: 10px;
}

.stat-label {
  color: #6b7280;
}

.stat-value {
  color: #10b981;
  font-weight: 600;
}

/* Monitor Footer */
.monitor-footer {
  background: #374151;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #4b5563;
  min-height: 36px;
}

.refresh-btn,
.fullscreen-btn {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #60a5fa;
  color: #60a5fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.refresh-btn:hover:not(:disabled),
.fullscreen-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar Styling */
.monitor-content::-webkit-scrollbar,
.credentials-data::-webkit-scrollbar {
  width: 6px;
}

.monitor-content::-webkit-scrollbar-track,
.credentials-data::-webkit-scrollbar-track {
  background: #1f2937;
}

.monitor-content::-webkit-scrollbar-thumb,
.credentials-data::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.monitor-content::-webkit-scrollbar-thumb:hover,
.credentials-data::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Responsive Design */
@media (max-width: 480px) {
  .monitor-container {
    height: 350px;
    font-size: 10px;
  }

  .table-header,
  .credential-row {
    grid-template-columns: 1.8fr 1.2fr 0.8fr 0.8fr;
    font-size: 9px;
    gap: 4px;
  }

  .monitor-title {
    font-size: 10px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .monitor-header {
    padding: 6px 12px;
  }

  .monitor-content {
    padding: 8px;
  }

  .credentials-data {
    max-height: 160px;
  }
}

@media (max-width: 360px) {
  .monitor-container {
    height: 320px;
    font-size: 9px;
    border-radius: 8px;
  }

  .table-header,
  .credential-row {
    grid-template-columns: 1.6fr 1fr 0.7fr 0.7fr;
    font-size: 8px;
    gap: 3px;
    padding: 4px 2px;
  }

  .monitor-title {
    font-size: 9px;
    display: none; /* Hide title on very small screens */
  }

  .connection-status {
    font-size: 8px;
  }

  .monitor-header {
    padding: 4px 8px;
    min-height: 32px;
  }

  .monitor-content {
    padding: 6px;
  }

  .credentials-data {
    max-height: 140px;
  }

  .monitor-footer {
    padding: 4px 8px;
    min-height: 28px;
  }

  .refresh-btn,
  .fullscreen-btn {
    padding: 2px 6px;
    font-size: 8px;
  }

  .console-line {
    gap: 4px;
    margin-bottom: 2px;
  }

  .timestamp,
  .status {
    font-size: 8px;
  }

  .stats-grid .stat-item {
    padding: 2px 4px;
    font-size: 8px;
  }
}

@media (max-width: 320px) {
  .monitor-container {
    height: 300px;
    font-size: 8px;
    border-radius: 6px;
  }

  .table-header,
  .credential-row {
    grid-template-columns: 1.4fr 0.8fr 0.6fr 0.6fr;
    font-size: 7px;
    gap: 2px;
    padding: 3px 1px;
  }

  .monitor-title {
    display: none;
  }

  .connection-status {
    font-size: 7px;
  }

  .monitor-header {
    padding: 3px 6px;
    min-height: 28px;
  }

  .monitor-info {
    display: none; /* Hide connection status on 320px */
  }

  .monitor-content {
    padding: 4px;
  }

  .credentials-data {
    max-height: 120px;
  }

  .monitor-footer {
    padding: 3px 6px;
    min-height: 24px;
  }

  .refresh-btn,
  .fullscreen-btn {
    padding: 2px 4px;
    font-size: 7px;
  }

  .console-line {
    gap: 3px;
    margin-bottom: 1px;
  }

  .console-header {
    margin-bottom: 8px;
  }

  .data-header {
    margin-bottom: 6px;
  }

  .table-header {
    padding: 4px 2px;
    font-size: 7px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .stats-grid .stat-item {
    padding: 2px 3px;
    font-size: 7px;
  }

  .pagination-buttons {
    gap: 6px;
  }

  .page-btn {
    padding: 2px 6px;
    font-size: 7px;
  }

  /* Simplified layout for very small screens */
  .col-email {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col-password {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
