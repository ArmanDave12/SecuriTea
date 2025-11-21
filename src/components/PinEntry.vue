<template>
  <div class="pin-entry-section">
    <!-- Enhanced Selected Account Display with Transitions -->
    <transition name="account-slide" appear>
      <div class="selected-account-display">
        <div class="selected-account-content">
          <div class="selected-account-info">
            <div class="account-avatar-container">
              <q-avatar size="32px" class="account-avatar">
                <q-icon name="person" size="18px" />
              </q-avatar>
              <div class="online-indicator"></div>
            </div>
            <div class="account-details">
              <span class="account-name">{{
                selectedAccount.nickname || selectedAccount.username
              }}</span>
              <span class="account-subtitle">Authenticated User</span>
            </div>
          </div>
          <button type="button" class="change-account-btn" @click="$emit('change-account')">
            <div class="btn-content">
              <q-icon name="swap_horiz" size="16px" class="swap-icon" />
              <span class="btn-text">Change</span>
            </div>
            <div class="btn-ripple"></div>
          </button>
        </div>
        <div class="account-display-accent"></div>
      </div>
    </transition>

    <transition name="title-fade" appear>
      <h5 class="step-title">
        Enter PIN for
        {{
          (selectedAccount.nickname || selectedAccount.username)?.charAt(0).toUpperCase() +
          (selectedAccount.nickname || selectedAccount.username)?.slice(1)
        }}
      </h5>
    </transition>

    <!-- PIN Display with staggered animations -->
    <transition name="pin-display-slide" appear>
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
            :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
          ></div>
        </div>
      </div>
    </transition>

    <!-- Lockout Display with bounce animation -->
    <transition name="lockout-bounce" appear>
      <div v-if="isLocked" class="lockout-display">
        <div class="lockout-content">
          <div class="lockout-icon-wrapper">
            <q-icon name="lock_clock" size="32px" class="lockout-icon" />
            <div class="pulse-ring"></div>
          </div>
          <div class="lockout-text">Access Denied</div>
          <div class="lockout-countdown">{{ Math.ceil(lockTimeLeft / 1000) }}s</div>
          <div class="lockout-message">Please wait before trying again</div>
        </div>
      </div>
    </transition>

    <!-- PIN Keypad with staggered button animations -->
    <transition name="keypad-fade" appear>
      <div class="keypad-section" v-if="!isLocked">
        <div class="pin-keypad">
          <!-- Number rows with staggered animations -->
          <div class="keypad-row">
            <button
              v-for="(num, index) in [1, 2, 3]"
              :key="num"
              type="button"
              class="keypad-btn number-btn"
              :style="{ animationDelay: `${0.5 + index * 0.05}s` }"
              @click="$emit('add-pin-digit', num)"
              :disabled="pin.length >= 4 || isLoading"
            >
              {{ num }}
            </button>
          </div>

          <div class="keypad-row">
            <button
              v-for="(num, index) in [4, 5, 6]"
              :key="num"
              type="button"
              class="keypad-btn number-btn"
              :style="{ animationDelay: `${0.65 + index * 0.05}s` }"
              @click="$emit('add-pin-digit', num)"
              :disabled="pin.length >= 4 || isLoading"
            >
              {{ num }}
            </button>
          </div>

          <div class="keypad-row">
            <button
              v-for="(num, index) in [7, 8, 9]"
              :key="num"
              type="button"
              class="keypad-btn number-btn"
              :style="{ animationDelay: `${0.8 + index * 0.05}s` }"
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
              style="animation-delay: 0.95s"
              @click="$emit('clear-pin')"
              :disabled="pin.length === 0 || isLoading"
              title="Delete"
            >
              <q-icon name="backspace" size="18px" />
            </button>

            <button
              type="button"
              class="keypad-btn number-btn zero-btn"
              style="animation-delay: 1s"
              @click="$emit('add-pin-digit', 0)"
              :disabled="pin.length >= 4 || isLoading"
            >
              0
            </button>

            <button
              type="button"
              class="keypad-btn action-btn visibility-btn"
              style="animation-delay: 1.05s"
              @click="$emit('toggle-pin-visibility')"
              :disabled="isLoading"
              :title="isPinVisible ? 'Hide PIN' : 'Show PIN'"
            >
              <q-icon :name="isPinVisible ? 'visibility_off' : 'visibility'" size="18px" />
            </button>
          </div>
        </div>
      </div>
    </transition>
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
/* Enhanced transitions */
.account-slide-enter-active {
  animation: slideInFromTop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.title-fade-enter-active {
  animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
}

.pin-display-slide-enter-active {
  animation: slideInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

.keypad-fade-enter-active {
  animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both;
}

.lockout-bounce-enter-active {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Keyframes */
@keyframes slideInFromTop {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInScale {
  0% {
    transform: translateY(15px) scale(0.9);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes bounceIn {
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

/* Step 2: PIN Entry */
.pin-entry-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  position: relative;
}

/* Enhanced Selected Account Display */
.selected-account-display {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(30, 58, 138, 0.08) 100%);
  border: 2px solid rgba(0, 128, 128, 0.15);
  border-radius: 16px;
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 128, 128, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex-shrink: 0;
}

.selected-account-display:hover {
  border-color: rgba(0, 128, 128, 0.25);
  box-shadow: 0 6px 16px rgba(0, 128, 128, 0.15);
  transform: translateY(-1px);
}

.selected-account-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  position: relative;
  z-index: 2;
}

.selected-account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.account-avatar-container {
  position: relative;
}

.account-avatar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 128, 128, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-name {
  color: #008080;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
}

.account-subtitle {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-account-btn {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid rgba(0, 128, 128, 0.2);
  color: #008080;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.change-account-btn:hover {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  color: white;
  border-color: #008080;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 128, 128, 0.2);
}

.change-account-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 128, 128, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 2;
}

.swap-icon {
  transition: transform 0.3s ease;
}

.change-account-btn:hover .swap-icon {
  transform: rotate(180deg);
}

.btn-text {
  transition: all 0.3s ease;
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

.change-account-btn:active .btn-ripple {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s ease;
}

.account-display-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #008080 0%, #1e3a8a 100%);
  opacity: 0.7;
}

.step-title {
  color: #475569;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 2px 0 0 0;
  text-align: center;
  position: relative;
  flex-shrink: 0;
}

/* .step-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #008080 0%, #1e3a8a 100%);
  border-radius: 1px;
} */

/* Enhanced PIN display */
.pin-display-section {
  text-align: center;
  margin: 1px 0 0 0;
  flex-shrink: 0;
}

.pin-display {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 16px 0;
}

.pin-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #cbd5e1;
  background: transparent;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  animation: pinDotSlide 0.6s ease-out both;
}

.pin-dot::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.pin-dot.filled {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  border-color: #008080;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(0, 128, 128, 0.4);
}

.pin-dot.filled::before {
  opacity: 0.3;
  transform: scale(1.2);
}

.pin-dot.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
}

.pin-dot.shake {
  animation: enhancedShake 0.6s ease-in-out;
}

@keyframes pinDotSlide {
  0% {
    transform: translateY(10px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes enhancedShake {
  0%,
  100% {
    transform: translateX(0) scale(1);
  }
  10% {
    transform: translateX(-4px) scale(1.05);
  }
  20% {
    transform: translateX(4px) scale(1.05);
  }
  30% {
    transform: translateX(-4px) scale(1.05);
  }
  40% {
    transform: translateX(4px) scale(1.05);
  }
  50% {
    transform: translateX(-3px) scale(1.02);
  }
  60% {
    transform: translateX(3px) scale(1.02);
  }
  70% {
    transform: translateX(-2px) scale(1.01);
  }
  80% {
    transform: translateX(2px) scale(1.01);
  }
  90% {
    transform: translateX(-1px) scale(1);
  }
}

/* Enhanced Lockout display */
.lockout-display {
  text-align: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin: 12px 0;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  flex-shrink: 0;
}

.lockout-content {
  position: relative;
}

.lockout-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.lockout-icon {
  color: #ef4444;
  position: relative;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  animation: pulseRing 2s infinite ease-out;
}

@keyframes pulseRing {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.lockout-text {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 8px;
}

.lockout-countdown {
  font-size: 28px;
  color: #dc2626;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.lockout-message {
  font-size: 14px;
  color: #7f1d1d;
  font-weight: 500;
}

/* Fixed Keypad Layout */
.keypad-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
  position: relative;
  padding-bottom: 20px; /* Ensure space for footer */
}

.pin-keypad {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  justify-content: flex-start;
  min-height: 280px; /* Ensure minimum space for buttons */
}

.keypad-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.keypad-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  color: #475569;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  animation: keypadSlideUp 0.6s ease-out both;
}

@keyframes keypadSlideUp {
  0% {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.keypad-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.2) 0%, transparent 70%);
  transform: scale(0);
  transition: transform 0.3s ease;
}

.keypad-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
  border-color: #008080;
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 128, 128, 0.2);
}

.keypad-btn:hover:not(:disabled)::before {
  transform: scale(1);
}

.keypad-btn:active:not(:disabled) {
  transform: scale(0.95) translateY(0);
  background: linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 100%);
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
    width: 56px;
    height: 56px;
    font-size: 18px;
  }

  .selected-account-content {
    padding: 12px;
  }

  .account-avatar {
    width: 28px;
    height: 28px;
  }

  .pin-keypad {
    gap: 8px;
    min-height: 260px;
  }
}

@media (max-width: 360px) {
  .keypad-btn {
    width: 50px;
    height: 50px;
    font-size: 16px;
  }

  .pin-display {
    gap: 12px;
  }

  .pin-dot {
    width: 16px;
    height: 16px;
  }

  .pin-keypad {
    min-height: 240px;
  }
}

@media (max-height: 700px) {
  .keypad-btn {
    width: 56px;
    height: 56px;
  }

  .pin-keypad {
    gap: 8px;
    min-height: 220px;
  }

  .keypad-section {
    padding-bottom: 15px;
  }
}

@media (max-height: 600px) {
  .keypad-btn {
    width: 50px;
    height: 50px;
    font-size: 16px;
  }

  .pin-keypad {
    gap: 6px;
    min-height: 200px;
  }

  .keypad-section {
    padding-bottom: 10px;
  }
}

/* Dark mode enhancements */
.body--dark .step-title {
  color: #94a3b8;
}

.body--dark .selected-account-display {
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.15) 0%, rgba(30, 58, 138, 0.1) 100%);
  border-color: rgba(0, 128, 128, 0.25);
}

.body--dark .account-subtitle {
  color: #94a3b8;
}

.body--dark .change-account-btn {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  border-color: rgba(0, 128, 128, 0.3);
  color: #10b981;
}

.body--dark .change-account-btn:hover {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  color: white;
}

.body--dark .keypad-btn {
  background: linear-gradient(145deg, #374151 0%, #4b5563 100%);
  border-color: #4b5563;
  color: #e5e7eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.body--dark .number-btn {
  background: linear-gradient(145deg, #374151 0%, #4b5563 100%);
}
</style>
