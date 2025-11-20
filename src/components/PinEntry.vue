<template>
  <div class="pin-entry-section">
    <!-- Selected Account Display -->
    <div class="selected-account-display">
      <div class="selected-account-info">
        <q-icon name="person" size="20px" class="account-icon" />
        <span class="account-name">{{ selectedAccount.nickname || selectedAccount.username }}</span>
      </div>
      <button type="button" class="change-account-btn" @click="$emit('change-account')">
        <q-icon name="swap_horiz" size="14px" />
        <span>Change</span>
      </button>
    </div>

    <h5 class="step-title">
      Enter PIN for
      {{
        (selectedAccount.nickname || selectedAccount.username)?.charAt(0).toUpperCase() +
        (selectedAccount.nickname || selectedAccount.username)?.slice(1)
      }}
    </h5>

    <!-- PIN Display -->
    <div class="pin-display-section">
      <div class="pin-display">
        <div
          v-for="i in 4"
          :key="i"
          class="pin-dot"
          :class="{
            filled: pin.length >= i,
            shake: pinError,
            error: pinError && pin.length >= i,
          }"
        ></div>
      </div>
    </div>

    <!-- Lockout Display -->
    <div v-if="isLocked" class="lockout-display">
      <q-icon name="lock_clock" size="24px" class="lockout-icon" />
      <div class="lockout-text">Access Denied</div>
      <div class="lockout-countdown">{{ Math.ceil(lockTimeLeft / 1000) }}s</div>
    </div>

    <!-- PIN Keypad -->
    <div class="keypad-section" v-if="!isLocked">
      <div class="pin-keypad">
        <!-- Number rows -->
        <div class="keypad-row">
          <button
            v-for="num in [1, 2, 3]"
            :key="num"
            type="button"
            class="keypad-btn number-btn"
            @click="$emit('add-pin-digit', num)"
            :disabled="pin.length >= 4 || isLoading"
          >
            {{ num }}
          </button>
        </div>

        <div class="keypad-row">
          <button
            v-for="num in [4, 5, 6]"
            :key="num"
            type="button"
            class="keypad-btn number-btn"
            @click="$emit('add-pin-digit', num)"
            :disabled="pin.length >= 4 || isLoading"
          >
            {{ num }}
          </button>
        </div>

        <div class="keypad-row">
          <button
            v-for="num in [7, 8, 9]"
            :key="num"
            type="button"
            class="keypad-btn number-btn"
            @click="$emit('add-pin-digit', num)"
            :disabled="pin.length >= 4 || isLoading"
          >
            {{ num }}
          </button>
        </div>

        <!-- Bottom row -->
        <div class="keypad-row">
          <button
            type="button"
            class="keypad-btn action-btn delete-btn"
            @click="$emit('clear-pin')"
            :disabled="pin.length === 0 || isLoading"
            title="Delete"
          >
            <q-icon name="backspace" size="16px" />
          </button>

          <button
            type="button"
            class="keypad-btn number-btn zero-btn"
            @click="$emit('add-pin-digit', 0)"
            :disabled="pin.length >= 4 || isLoading"
          >
            0
          </button>

          <button
            type="button"
            class="keypad-btn action-btn visibility-btn"
            @click="$emit('toggle-pin-visibility')"
            :disabled="isLoading"
            :title="isPinVisible ? 'Hide PIN' : 'Show PIN'"
          >
            <q-icon :name="isPinVisible ? 'visibility_off' : 'visibility'" size="16px" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  selectedAccount: {
    type: Object,
    required: true,
  },
  pin: {
    type: String,
    default: '',
  },
  isPinVisible: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  pinError: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockTimeLeft: {
    type: Number,
    default: 0,
  },
})

// Emits
const emit = defineEmits(['change-account', 'add-pin-digit', 'clear-pin', 'toggle-pin-visibility'])
</script>

<style scoped>
/* Step 2: PIN Entry */
.pin-entry-section {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.selected-account-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 128, 128, 0.1);
  border: 1px solid rgba(0, 128, 128, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.selected-account-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #008080;
  font-weight: 500;
  font-size: 14px;
}

.account-icon {
  color: #008080;
}

.change-account-btn {
  background: none;
  border: 1px solid #008080;
  color: #008080;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.change-account-btn:hover {
  background: #008080;
  color: white;
}

.step-title {
  color: #475569;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 8px 0 16px 0;
  text-align: center;
}

/* PIN display */
.pin-display-section {
  text-align: center;
  flex: 0 0 auto;
  margin: 8px 0;
}

.pin-display {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 12px 0;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #94a3b8;
  background: transparent;
  transition: all 0.3s ease;
}

.pin-dot.filled {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  border-color: #008080;
  transform: scale(1.1);
}

.pin-dot.error {
  background: #ef4444;
  border-color: #ef4444;
}

.pin-dot.shake {
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-3px);
  }
  40% {
    transform: translateX(3px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
}

/* Lockout display */
.lockout-display {
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
}

.lockout-icon {
  color: #ef4444;
  margin-bottom: 8px;
}

.lockout-text {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 8px;
}

.lockout-countdown {
  font-size: 20px;
  color: #dc2626;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.keypad-section {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.pin-keypad {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.keypad-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.keypad-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.keypad-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #008080;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 128, 128, 0.2);
}

.keypad-btn:active:not(:disabled) {
  transform: scale(0.95);
  background: #e2e8f0;
}

.keypad-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.number-btn {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-color: #cbd5e1;
}

.action-btn {
  background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
}

.delete-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #fef3c7 0%, #fed7aa 100%);
  border-color: #f59e0b;
  color: #d97706;
}

.visibility-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #ddd6fe 0%, #c4b5fd 100%);
  border-color: #8b5cf6;
  color: #7c3aed;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .keypad-btn {
    width: 52px;
    height: 52px;
    font-size: 16px;
  }
}

@media (max-width: 360px) {
  .keypad-btn {
    width: 48px;
    height: 48px;
    font-size: 15px;
  }
}

@media (max-height: 700px) {
  .keypad-btn {
    width: 50px;
    height: 50px;
  }
}

@media (max-height: 500px) {
  .keypad-btn {
    width: 44px;
    height: 44px;
    font-size: 14px;
  }
}

/* Dark mode */
.body--dark .step-title {
  color: #94a3b8;
}

.body--dark .selected-account-display {
  background: rgba(0, 128, 128, 0.15);
  border-color: rgba(0, 128, 128, 0.3);
}

.body--dark .keypad-btn {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

.body--dark .number-btn {
  background: linear-gradient(145deg, #374151 0%, #4b5563 100%);
}
</style>
