<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="signup-card q-pa-md shadow-5" flat bordered>
      <!-- Logo / Branding -->
      <div class="text-center q-mb-md">
        <div class="brand-logo-container">
          <q-avatar size="60px" font-size="28px" class="brand-avatar">
            <q-icon name="person_add" class="brand-icon" />
            <!-- Decorative accents -->
            <div class="accent-dot accent-1"></div>
            <div class="accent-dot accent-2"></div>
            <div class="accent-dot accent-3"></div>
          </q-avatar>
        </div>
        <h4 class="q-mt-sm q-mb-xs text-weight-bold brand-title">SecuriTea</h4>
        <h5 class="q-mt-xs q-mb-xs text-weight-medium slate-text">Create Account</h5>
        <p class="slate-text-light q-my-none compact-subtitle">Join us today</p>
      </div>

      <!-- Signup Form -->
      <q-form @submit.prevent="onSubmit" class="q-gutter-sm">
        <!-- Nickname -->
        <q-input
          v-model="nickname"
          label="Choose a Nickname"
          outlined
          dense
          class="rounded-borders custom-input"
          :rules="[(val) => !!val || 'Nickname is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" class="input-icon" size="sm" />
          </template>
          <template v-slot:hint>
            <span class="compact-hint">This will be your display name</span>
          </template>
        </q-input>

        <!-- PIN -->
        <q-input
          v-model="pin"
          label="Create PIN"
          outlined
          dense
          maxlength="4"
          class="rounded-borders custom-input"
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
              class="cursor-pointer input-icon"
              size="sm"
              @click="isPinVisible = !isPinVisible"
            />
          </template>
          <template v-slot:hint>
            <span class="compact-hint">Exactly 4 characters</span>
          </template>
        </q-input>

        <!-- Confirm PIN -->
        <q-input
          v-model="confirmPin"
          label="Confirm PIN"
          outlined
          dense
          class="rounded-borders custom-input"
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

        <!-- Signup Button -->
        <q-btn
          type="submit"
          label="Sign Up"
          class="full-width rounded-borders compact-btn custom-btn"
          :loading="isLoading"
          unelevated
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" size="sm" />
          </template>
        </q-btn>

        <!-- Link to Login -->
        <div class="text-center q-mt-sm">
          <p class="q-mb-none slate-text-light compact-text">
            Already have an account?
            <router-link to="/login" class="login-link text-weight-medium">Log In</router-link>
          </p>
        </div>
      </q-form>
    </q-card>
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
const isLoading = loading // use the composable loading directly

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
.signup-card {
  width: 100%;
  max-width: 320px; /* Reduced from 400px */
  border-radius: 10px; /* Slightly smaller radius */
  border: 1px solid #94a3b8;
}

/* Brand Logo - Smaller */
.brand-logo-container {
  position: relative;
  display: inline-block;
}

.brand-avatar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
  position: relative;
  overflow: visible;
}

.brand-icon {
  font-size: 28px !important; /* Reduced from 40px */
  color: white !important;
  z-index: 2;
  position: relative;
}

/* Decorative Accent Dots - Smaller */
.accent-dot {
  position: absolute;
  border-radius: 50%;
  opacity: 0.8;
}

.accent-1 {
  width: 5px; /* Reduced from 6px */
  height: 5px;
  background: #65a30d;
  top: -6px; /* Adjusted positioning */
  right: -6px;
  animation: pulse 3s infinite ease-in-out;
}

.accent-2 {
  width: 3px; /* Reduced from 4px */
  height: 3px;
  background: #fb923c;
  bottom: -5px;
  left: -5px;
  animation: pulse 3s infinite ease-in-out 1s;
}

.accent-3 {
  width: 2px; /* Reduced from 3px */
  height: 2px;
  background: #65a30d;
  top: 8px;
  right: -8px;
  animation: pulse 3s infinite ease-in-out 2s;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.3);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

/* Text Styling - Smaller */
.brand-title {
  color: #008080 !important;
  font-size: 1.5rem !important; /* Reduced from 2rem */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slate-text {
  color: #475569 !important;
  font-size: 1rem !important; /* Smaller heading */
}

.slate-text-light {
  color: #64748b !important;
}

.compact-subtitle {
  font-size: 0.875rem !important; /* Smaller subtitle */
}

.compact-text {
  font-size: 0.875rem !important; /* Smaller body text */
}

.compact-hint {
  font-size: 0.75rem !important; /* Smaller hint text */
}

/* Form Styling - More Compact */
.custom-input {
  border-radius: 6px; /* Smaller border radius */
}

.custom-input :deep(.q-field__control) {
  border-color: #94a3b8 !important;
  min-height: 40px !important; /* Reduced height with dense prop */
}

.custom-input :deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 1px #008080 !important;
}

.custom-input :deep(.q-field__label) {
  color: #64748b !important;
  font-size: 0.875rem !important; /* Smaller label */
}

.custom-input :deep(.q-field--focused .q-field__label) {
  color: #008080 !important;
}

.custom-input :deep(.q-field__hint) {
  color: #64748b !important;
}

.input-icon {
  color: #64748b !important;
}

.custom-input:focus-within .input-icon {
  color: #008080 !important;
}

/* Button Styling - More Compact */
.compact-btn {
  padding: 8px 16px !important; /* Reduced padding */
  font-size: 0.875rem !important; /* Smaller font */
}

.custom-btn {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  color: white !important;
  border: none !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.custom-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.custom-btn:active {
  transform: translateY(0);
}

.custom-btn :deep(.q-spinner-dots) {
  color: white !important;
}

/* Link Styling */
.login-link {
  color: #65a30d !important;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
  font-size: 0.875rem !important; /* Smaller link */
}

.login-link:hover {
  border-bottom-color: #65a30d;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .signup-card {
    width: 95%; /* Increased width usage on mobile */
    margin: 0 8px; /* Reduced margins */
    max-width: 300px; /* Even smaller on mobile */
  }

  :deep(.q-field) {
    margin-bottom: 12px; /* Reduced spacing */
  }

  .brand-title {
    font-size: 1.25rem; /* Even smaller on mobile */
  }

  .compact-btn {
    padding: 6px 12px !important;
  }
}

/* Dark mode adjustments */
.body--dark .signup-card {
  background: #1e293b;
  border-color: #475569;
}

.body--dark .slate-text {
  color: #94a3b8 !important;
}

.body--dark .slate-text-light {
  color: #64748b !important;
}
</style>
