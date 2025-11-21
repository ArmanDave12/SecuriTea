<template>
  <q-page class="signup-page">
    <div class="signup-viewport">
      <!-- Floating background decorations -->
      <div class="bg-decoration bg-decoration-1"></div>
      <div class="bg-decoration bg-decoration-2"></div>
      <div class="bg-decoration bg-decoration-3"></div>

      <!-- Animated signup card -->
      <transition name="card-entrance" appear>
        <q-card class="signup-card shadow-10" flat bordered>
          <!-- Animated Logo / Branding -->
          <transition name="brand-slide" appear>
            <div class="text-center brand-section">
              <div class="brand-logo-container">
                <q-avatar size="60px" font-size="28px" class="brand-avatar">
                  <!-- <q-icon name="person_add" class="brand-icon" /> -->
                  <img src="../../assets/SecuriTea.png" alt="SecuriTea Logo" />
                  <!-- Enhanced decorative accents -->
                  <div class="accent-dot accent-1"></div>
                  <div class="accent-dot accent-2"></div>
                  <div class="accent-dot accent-3"></div>
                  <!-- Logo glow effect -->
                  <div class="logo-glow"></div>
                </q-avatar>
              </div>
              <h4 class="brand-title">SecuriTea</h4>
              <h5 class="brand-subtitle">Create Account</h5>
              <p class="brand-description">Join us today</p>
              <div class="brand-divider"></div>
            </div>
          </transition>

          <!-- Animated Signup Form -->
          <transition name="form-slide" appear>
            <q-form @submit.prevent="onSubmit" class="signup-form">
              <!-- Nickname field with staggered animation -->
              <div class="input-wrapper" :style="{ animationDelay: '0.1s' }">
                <q-input
                  v-model="nickname"
                  label="Choose a Nickname"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[(val) => !!val || 'Nickname is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" class="input-icon" size="sm" />
                  </template>
                  <template v-slot:hint>
                    <span class="input-hint">This will be your display name</span>
                  </template>
                </q-input>
              </div>

              <!-- PIN field with staggered animation -->
              <div class="input-wrapper" :style="{ animationDelay: '0.2s' }">
                <q-input
                  v-model="pin"
                  label="Create PIN"
                  outlined
                  dense
                  maxlength="4"
                  class="custom-input"
                  :type="isPinVisible ? 'text' : 'password'"
                  :rules="[
                    (val) => !!val || 'PIN is required',
                    (val) => val.length === 4 || 'PIN must be exactly 4 characters',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" class="input-icon" size="sm" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPinVisible ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer input-icon toggle-icon"
                      size="sm"
                      @click="togglePinVisibility"
                    />
                  </template>
                  <template v-slot:hint>
                    <span class="input-hint">Exactly 4 characters</span>
                  </template>
                </q-input>
              </div>

              <!-- Confirm PIN field with staggered animation -->
              <div class="input-wrapper" :style="{ animationDelay: '0.3s' }">
                <q-input
                  v-model="confirmPin"
                  label="Confirm PIN"
                  outlined
                  dense
                  class="custom-input"
                  :type="isPinVisible ? 'text' : 'password'"
                  :rules="[
                    (val) => !!val || 'Please confirm your PIN',
                    (val) => val === pin || 'PINs do not match',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" class="input-icon" size="sm" />
                  </template>
                </q-input>
              </div>

              <!-- Animated Signup Button -->
              <div class="button-wrapper" :style="{ animationDelay: '0.4s' }">
                <q-btn type="submit" class="signup-btn full-width" :loading="isLoading" unelevated>
                  <div class="btn-content">
                    <q-icon name="person_add" size="18px" class="btn-icon" />
                    <span>Sign Up</span>
                  </div>
                  <div class="btn-ripple"></div>

                  <template v-slot:loading>
                    <div class="loading-content">
                      <q-spinner-dots color="white" size="20px" />
                      <span class="loading-text">Creating account...</span>
                    </div>
                  </template>
                </q-btn>
              </div>

              <!-- Animated Link to Login -->
              <transition name="footer-fade" appear>
                <div class="footer-section" :style="{ animationDelay: '0.5s' }">
                  <div class="footer-content">
                    <span class="footer-text">Already have an account?</span>
                    <router-link to="/login" class="login-link">
                      <q-icon name="login" size="14px" />
                      <span>Log In</span>
                    </router-link>
                  </div>
                  <div class="footer-decoration"></div>
                </div>
              </transition>
            </q-form>
          </transition>
        </q-card>
      </transition>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from 'src/composables/useAuth'

const router = useRouter()
const { signup, loading } = useAuth()

const nickname = ref('')
const pin = ref('')
const confirmPin = ref('')
const isPinVisible = ref(false)
const isLoading = loading

// Enhanced PIN visibility toggle with animation feedback
const togglePinVisibility = () => {
  isPinVisible.value = !isPinVisible.value
}

// Handle form submission
const onSubmit = async () => {
  // Basic front-end validation
  if (!nickname.value || nickname.value.length < 3) return
  if (!pin.value || pin.value.length !== 4) return
  if (pin.value !== confirmPin.value) return

  // Call composable signup (auto handles QNotify)
  const newUser = await signup(nickname.value, pin.value)
  if (newUser) {
    router.push('/login') // navigate after successful signup
  }
}
</script>

<style scoped>
/* Enhanced page transitions */
.card-entrance-enter-active {
  animation: cardSlideIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.brand-slide-enter-active {
  animation: brandFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
}

.form-slide-enter-active {
  animation: formSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both;
}

.footer-fade-enter-active {
  animation: footerFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both;
}

/* Keyframes for main transitions */
@keyframes cardSlideIn {
  0% {
    transform: translateY(40px) scale(0.95);
    opacity: 0;
  }
  60% {
    transform: translateY(-5px) scale(1.01);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes brandFadeIn {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes formSlideUp {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes footerFadeIn {
  0% {
    transform: translateY(15px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes inputSlideIn {
  0% {
    transform: translateX(-20px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes buttonBounceIn {
  0% {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
  60% {
    transform: translateY(-3px) scale(1.02);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Enhanced page layout */
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.signup-viewport {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Enhanced floating background decorations */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(30, 58, 138, 0.03) 100%);
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}

.bg-decoration-1 {
  width: 300px;
  height: 300px;
  top: -10%;
  right: -15%;
  animation-delay: 0s;
}

.bg-decoration-2 {
  width: 200px;
  height: 200px;
  bottom: -5%;
  left: -10%;
  animation-delay: 3s;
}

.bg-decoration-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -5%;
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.1;
  }
}

/* Enhanced signup card */
.signup-card {
  width: 100%;
  max-width: 340px;
  border-radius: 16px;
  border: 1px solid rgba(203, 213, 225, 0.5);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 128, 128, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.signup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 128, 128, 0.5) 50%, transparent 100%);
}

/* Enhanced brand section */
.brand-section {
  margin-bottom: 20px;
}

.brand-logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.brand-avatar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
  position: relative;
  overflow: visible;
  box-shadow:
    0 8px 32px rgba(0, 128, 128, 0.3),
    0 4px 16px rgba(30, 58, 138, 0.2);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.brand-avatar:hover {
  transform: scale(1.05);
  box-shadow:
    0 12px 40px rgba(0, 128, 128, 0.4),
    0 6px 20px rgba(30, 58, 138, 0.3);
}

.brand-icon {
  font-size: 28px !important;
  color: white !important;
  z-index: 2;
  position: relative;
}

.logo-glow {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: radial-gradient(circle, rgba(0, 128, 128, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: logoGlow 4s ease-in-out infinite;
}

@keyframes logoGlow {
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

/* Enhanced decorative accent dots */
.accent-dot {
  position: absolute;
  border-radius: 50%;
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.accent-1 {
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%);
  top: -8px;
  right: -8px;
  animation: accentPulse 3s infinite ease-in-out;
}

.accent-2 {
  width: 4px;
  height: 4px;
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  bottom: -6px;
  left: -6px;
  animation: accentPulse 3s infinite ease-in-out 1s;
}

.accent-3 {
  width: 3px;
  height: 3px;
  background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%);
  top: 8px;
  right: -10px;
  animation: accentPulse 3s infinite ease-in-out 2s;
}

@keyframes accentPulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.4);
  }
}

/* Enhanced text styling */
.brand-title {
  color: #008080 !important;
  font-size: 1.6rem !important;
  font-weight: 700;
  margin: 8px 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 128, 128, 0.2);
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  color: #475569 !important;
  font-size: 1.1rem !important;
  font-weight: 600;
  margin: 4px 0 2px 0;
}

.brand-description {
  color: #64748b !important;
  font-size: 0.9rem !important;
  margin: 2px 0 12px 0;
}

.brand-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #008080 0%, #1e3a8a 100%);
  margin: 0 auto;
  border-radius: 1px;
  opacity: 0.6;
}

/* Enhanced form styling */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-wrapper {
  animation: inputSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.custom-input {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.custom-input :deep(.q-field__control) {
  border-color: #cbd5e1 !important;
  border-width: 2px !important;
  min-height: 44px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow:
    0 0 0 1px rgba(0, 128, 128, 0.3),
    0 4px 12px rgba(0, 128, 128, 0.1);
  background: #ffffff;
  transform: translateY(-1px);
}

.custom-input :deep(.q-field__label) {
  color: #64748b !important;
  font-size: 0.9rem !important;
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

.input-hint {
  color: #64748b !important;
  font-size: 0.75rem !important;
}

/* Enhanced button styling */
.button-wrapper {
  animation: buttonBounceIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.signup-btn {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 600;
  font-size: 0.95rem !important;
  text-transform: none;
  letter-spacing: 0.5px;
  padding: 12px 20px !important;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 16px rgba(0, 128, 128, 0.2);
}

.signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 128, 128, 0.3);
}

.signup-btn:active {
  transform: translateY(-1px);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.signup-btn:hover .btn-icon {
  transform: scale(1.1);
}

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
}

.signup-btn:active .btn-ripple {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s ease;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-text {
  font-size: 0.85rem;
}

/* Enhanced footer section */
.footer-section {
  text-align: center;
  margin-top: 8px;
  position: relative;
  animation: footerFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.footer-text {
  color: #64748b !important;
  font-size: 0.85rem !important;
}

.login-link {
  color: #65a30d !important;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem !important;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, transparent 0%, rgba(101, 163, 13, 0.05) 100%);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.login-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(101, 163, 13, 0.1) 50%, transparent 100%);
  transition: left 0.5s ease;
}

.login-link:hover {
  background: linear-gradient(135deg, rgba(101, 163, 13, 0.1) 0%, rgba(101, 163, 13, 0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(101, 163, 13, 0.2);
}

.login-link:hover::before {
  left: 100%;
}

.footer-decoration {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 128, 128, 0.3) 50%, transparent 100%);
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .signup-card {
    max-width: 320px;
    padding: 20px;
    border-radius: 14px;
  }

  .brand-title {
    font-size: 1.4rem !important;
  }

  .brand-subtitle {
    font-size: 1rem !important;
  }

  .signup-btn {
    padding: 10px 16px !important;
    font-size: 0.9rem !important;
  }
}

@media (max-width: 360px) {
  .signup-card {
    max-width: 300px;
    padding: 16px;
  }

  .brand-title {
    font-size: 1.3rem !important;
  }
}

/* Enhanced Dark mode */
.body--dark .signup-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.body--dark .signup-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-color: rgba(71, 85, 105, 0.5);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 4px 20px rgba(0, 128, 128, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.body--dark .signup-card::before {
  background: linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.5) 50%, transparent 100%);
}

.body--dark .brand-title {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.body--dark .brand-subtitle {
  color: #94a3b8 !important;
}

.body--dark .brand-description {
  color: #64748b !important;
}

.body--dark .brand-divider {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.body--dark .custom-input :deep(.q-field__control) {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  border-color: #475569 !important;
}

.body--dark .custom-input :deep(.q-field--focused .q-field__control) {
  background: #334155;
  border-color: #10b981 !important;
  box-shadow:
    0 0 0 1px rgba(16, 185, 129, 0.3),
    0 4px 12px rgba(16, 185, 129, 0.1);
}

.body--dark .custom-input :deep(.q-field__label) {
  color: #94a3b8 !important;
}

.body--dark .custom-input :deep(.q-field--focused .q-field__label) {
  color: #10b981 !important;
}

.body--dark .input-icon {
  color: #94a3b8 !important;
}

.body--dark .custom-input:focus-within .input-icon {
  color: #10b981 !important;
}

.body--dark .footer-text {
  color: #94a3b8 !important;
}

.body--dark .login-link {
  color: #10b981 !important;
  background: linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.05) 100%);
}

.body--dark .login-link:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.body--dark .footer-decoration {
  background: linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%);
}

.body--dark .bg-decoration {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(5, 150, 105, 0.02) 100%);
}
</style>
