<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="login-card q-pa-lg shadow-5" flat bordered>
      <!-- Logo/Branding -->
      <div class="text-center q-mb-lg">
        <div class="brand-logo-container">
          <q-avatar size="80px" font-size="40px" class="brand-avatar">
            <!-- <q-icon name="local_cafe" class="brand-icon" /> -->
            <img src="../../assets/SecuriTea.png" alt="SecuriTea Logo" />
            <!-- Steam effect -->
            <div class="steam-accent steam-1"></div>
            <div class="steam-accent steam-2"></div>
            <div class="steam-accent steam-3"></div>
          </q-avatar>
        </div>
        <h3 class="q-mt-md q-mb-xs text-weight-bold brand-title">SecuriTea</h3>
        <h4 class="q-mt-sm q-mb-xs text-weight-medium slate-text">Welcome Back</h4>
        <p class="slate-text-light q-my-none">Sign in to continue</p>
      </div>

      <!-- Login Form -->
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Nickname Input -->
        <q-input
          v-model="nickname"
          label="Nickname"
          outlined
          class="rounded-borders custom-input"
          :rules="[(val) => !!val || 'Nickname is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" class="input-icon" />
          </template>
        </q-input>

        <!-- PIN Input -->
        <q-input
          v-model="pin"
          label="PIN"
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
        </q-input>

        <!-- Error Message Display Area -->
        <div class="text-negative q-mb-md" v-if="error">
          {{ error }}
        </div>

        <!-- Login Button -->
        <q-btn
          type="submit"
          label="Login"
          class="full-width rounded-borders q-py-sm custom-btn"
          :loading="isLoading"
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>

        <!-- Signup Link -->
        <div class="text-center q-mt-md">
          <p class="q-mb-none slate-text-light">
            Don't have an account?
            <router-link to="/signup" class="signup-link text-weight-medium">Sign Up</router-link>
          </p>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from 'src/composables/useAuth'

const router = useRouter()
const { login, error, loading } = useAuth()

// State variables
const nickname = ref('')
const pin = ref('')
const isPinVisible = ref(false)
const isLoading = loading // Use loading state from useAuth

// Submit handler
const onSubmit = async () => {
  if (!nickname.value || !pin.value || pin.value.length < 4) return
  const user = await login(nickname.value, pin.value)
  if (user) {
    router.push('/main') // Navigate to main app page after login
  }
}
</script>

<style scoped>
.login-card {
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

/* Steam Effect */
.steam-accent {
  position: absolute;
  background: #fb923c;
  border-radius: 50%;
  opacity: 0.7;
}

.steam-1 {
  width: 4px;
  height: 4px;
  top: -8px;
  left: 28px;
  animation: steam 2s infinite ease-in-out;
}

.steam-2 {
  width: 3px;
  height: 3px;
  top: -12px;
  left: 35px;
  animation: steam 2s infinite ease-in-out 0.5s;
}

.steam-3 {
  width: 2px;
  height: 2px;
  top: -6px;
  left: 42px;
  animation: steam 2s infinite ease-in-out 1s;
}

@keyframes steam {
  0% {
    opacity: 0.7;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.4;
    transform: translateY(-10px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
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
.signup-link {
  color: #65a30d !important;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}

.signup-link:hover {
  border-bottom-color: #65a30d;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .login-card {
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
.body--dark .login-card {
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
