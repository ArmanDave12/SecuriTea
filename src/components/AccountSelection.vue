<template>
  <div class="account-selection-section">
    <h5 class="step-title">Choose Your Account</h5>

    <!-- Loading state -->
    <div v-if="loadingUsers" class="loading-users">
      <q-spinner color="primary" size="32px" />
      <div class="loading-text">Loading accounts...</div>
    </div>

    <!-- No users found -->
    <div v-else-if="!accounts.length" class="no-users">
      <q-icon name="person_off" size="48px" color="grey-4" />
      <div class="no-users-text">No accounts found</div>
      <q-btn
        flat
        color="primary"
        label="Refresh"
        icon="refresh"
        @click="$emit('refresh')"
        class="q-mt-md"
      />
    </div>

    <!-- Users grid with scrolling -->
    <div v-else class="accounts-container">
      <div class="accounts-grid">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="account-card"
          :class="{ selected: selectedAccount?.id === account.id }"
          @click="$emit('select-account', account)"
        >
          <div class="account-avatar">
            <q-icon name="person" size="28px" />
          </div>
          <div class="account-info">
            <div class="account-name">{{ account.nickname || account.username }}</div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator - always show if more than 3 accounts for consistency -->
      <div v-if="accounts.length > 3" class="scroll-indicator">
        <q-icon name="keyboard_arrow_down" size="16px" />
        <span>Scroll for more</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  accounts: {
    type: Array,
    default: () => [],
  },
  selectedAccount: {
    type: Object,
    default: null,
  },
  loadingUsers: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['select-account', 'refresh'])
</script>

<style scoped>
/* Step 1: Account Selection */
.account-selection-section {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.step-title {
  color: #475569;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 8px 0 16px 0;
  text-align: center;
}

/* Loading and empty states */
.loading-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  color: #64748b;
}

.loading-text {
  font-size: 14px;
  font-weight: 500;
}

.no-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  color: #64748b;
  text-align: center;
}

.no-users-text {
  font-size: 16px;
  font-weight: 500;
}

/* Accounts container */
.accounts-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 360px; /* Fixed height to ensure footer is always visible */
}

.accounts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  flex: 1;
  align-content: start;
  max-height: 320px; /* Allow for up to ~6 rows */
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar */
.accounts-grid::-webkit-scrollbar {
  width: 6px;
}

.accounts-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.accounts-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.accounts-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.account-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 84px;
}

.account-card:hover {
  border-color: #008080;
  background: #f8fafc;
  transform: scale(1.02);
}

.account-card.selected {
  border-color: #008080;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
  transform: scale(1.02);
}

.account-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.account-card.selected .account-avatar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  color: white;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 2px;
  line-height: 1.2;
}

/* Scroll indicator */
.scroll-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 12px;
  padding: 6px 0;
  opacity: 0.8;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .accounts-container {
    max-height: 400px;
  }

  .accounts-grid {
    gap: 10px;
    max-height: 360px;
  }

  .account-card {
    padding: 12px 8px;
    min-height: 76px;
  }

  .account-avatar {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 360px) {
  .accounts-grid {
    gap: 8px;
  }
}

@media (max-height: 700px) {
  .accounts-container {
    max-height: 280px;
  }

  .accounts-grid {
    max-height: 240px;
  }
}

@media (max-height: 500px) {
  .accounts-container {
    max-height: 200px;
  }

  .accounts-grid {
    gap: 6px;
    max-height: 160px;
  }

  .account-card {
    padding: 8px 6px;
    min-height: 68px;
  }
}

/* Dark mode */
.body--dark .step-title {
  color: #94a3b8;
}

.body--dark .loading-users,
.body--dark .no-users {
  color: #94a3b8;
}

.body--dark .account-card {
  background: #334155;
  border-color: #475569;
}

.body--dark .account-name {
  color: #e5e7eb;
}

.body--dark .accounts-grid::-webkit-scrollbar-track {
  background: #334155;
}

.body--dark .accounts-grid::-webkit-scrollbar-thumb {
  background: #475569;
}

.body--dark .accounts-grid::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
