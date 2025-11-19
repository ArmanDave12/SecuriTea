<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="signup-card q-pa-lg shadow-5" flat bordered>
      <!-- Logo / Branding -->
      <div class="text-center q-mb-lg">
        <div class="brand-logo-container">
          <q-avatar size="80px" font-size="40px" class="brand-avatar">
            <q-icon name="person_add" class="brand-icon" />
            <!-- Decorative accents -->
            <div class="accent-dot accent-1"></div>
            <div class="accent-dot accent-2"></div>
            <div class="accent-dot accent-3"></div>
          </q-avatar>
        </div>
        <h3 class="q-mt-md q-mb-xs text-weight-bold brand-title">SecuriTea</h3>
        <h4 class="q-mt-sm q-mb-xs text-weight-medium slate-text">Create Account</h4>
        <p class="slate-text-light q-my-none">Join us today</p>
      </div>

      <!-- Signup Form -->
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Nickname -->
        <q-input
          v-model="nickname"
          label="Choose a Nickname"
          outlined
          class="rounded-borders custom-input"
          :rules="[(val) => !!val || 'Nickname is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" class="input-icon" />
          </template>
          <template v-slot:hint> This will be your display name </template>
        </q-input>

        <!-- PIN -->
        <q-input
          v-model="pin"
          label="Create PIN"
          outlined
          class="rounded-borders custom-input"
          :type="isPinVisible ? 'text' : 'password'"
          :rules="[
            (val) => !!val || 'PIN is required',
            (val) => val.length >= 4 || 'PIN must be at least 4 characters',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" class="input-icon" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPinVisible ? 'visibility_off' : 'visibility'"
              class="cursor-pointer input-icon"
              @click="isPinVisible = !isPinVisible"
            />
          </template>
          <template v-slot:hint> Minimum 4 characters </template>
        </q-input>

        <!-- Confirm PIN -->
        <q-input
          v-model="confirmPin"
          label="Confirm PIN"
          outlined
          class="rounded-borders custom-input"
          :type="isPinVisible ? 'text' : 'password'"
          :rules="[
            (val) => !!val || 'Please confirm your PIN',
            (val) => val === pin || 'PINs do not match',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" class="input-icon" />
          </template>
        </q-input>

        <!-- Signup Button -->
        <q-btn
          type="submit"
          label="Sign Up"
          class="full-width rounded-borders q-py-sm custom-btn"
          :loading="isLoading"
          unelevated
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>

        <!-- Link to Login -->
        <div class="text-center q-mt-md">
          <p class="q-mb-none slate-text-light">
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
  if (!pin.value || pin.value.length < 4) return
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
  max-width: 400px;
  border-radius: 12px;
  border: 1px solid #94a3b8;
}

/* Brand Logo */
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
  font-size: 40px !important;
  color: white !important;
  z-index: 2;
  position: relative;
}

/* Decorative Accent Dots */
.accent-dot {
  position: absolute;
  border-radius: 50%;
  opacity: 0.8;
}

.accent-1 {
  width: 6px;
  height: 6px;
  background: #65a30d;
  top: -8px;
  right: -8px;
  animation: pulse 3s infinite ease-in-out;
}

.accent-2 {
  width: 4px;
  height: 4px;
  background: #fb923c;
  bottom: -6px;
  left: -6px;
  animation: pulse 3s infinite ease-in-out 1s;
}

.accent-3 {
  width: 3px;
  height: 3px;
  background: #65a30d;
  top: 10px;
  right: -10px;
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

/* Text Styling */
.brand-title {
  color: #008080 !important;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slate-text {
  color: #475569 !important;
}

.slate-text-light {
  color: #64748b !important;
}

/* Form Styling */
.custom-input {
  border-radius: 8px;
}

.custom-input :deep(.q-field__control) {
  border-color: #94a3b8 !important;
}

.custom-input :deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 1px #008080 !important;
}

.custom-input :deep(.q-field__label) {
  color: #64748b !important;
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

/* Button Styling */
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
}

.login-link:hover {
  border-bottom-color: #65a30d;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .signup-card {
    width: 90%;
    margin: 0 16px;
  }

  :deep(.q-field) {
    margin-bottom: 16px;
  }

  .brand-title {
    font-size: 1.75rem;
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
