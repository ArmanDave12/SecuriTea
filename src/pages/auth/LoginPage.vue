<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="login-card q-pa-lg shadow-5" flat bordered>
      <!-- Logo/Branding -->
      <div class="text-center q-mb-lg">
        <q-avatar
          size="80px"
          font-size="40px"
          color="primary"
          text-color="white"
          icon="account_circle"
        />
        <h4 class="q-mt-md q-mb-xs text-weight-bold">Welcome Back</h4>
        <p class="text-grey-7 q-my-none">Sign in to continue</p>
      </div>

      <!-- Login Form -->
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Nickname Input -->
        <q-input
          v-model="nickname"
          label="Nickname"
          outlined
          class="rounded-borders"
          :rules="[(val) => !!val || 'Nickname is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- PIN Input -->
        <q-input
          v-model="pin"
          label="PIN"
          outlined
          class="rounded-borders"
          :type="isPinVisible ? 'text' : 'password'"
          :rules="[
            (val) => !!val || 'PIN is required',
            (val) => val.length >= 4 || 'PIN must be at least 4 characters',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPinVisible ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
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
          color="primary"
          class="full-width rounded-borders q-py-sm"
          :loading="isLoading"
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>

        <!-- Signup Link -->
        <div class="text-center q-mt-md">
          <p class="q-mb-none text-grey-7">
            Don't have an account?
            <router-link to="/auth/signup" class="text-primary text-weight-medium"
              >Sign Up</router-link
            >
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
}
</style>
