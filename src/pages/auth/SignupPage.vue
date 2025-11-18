<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="signup-card q-pa-lg shadow-5" flat bordered>
      <!-- Logo / Branding -->
      <div class="text-center q-mb-lg">
        <q-avatar
          size="80px"
          font-size="40px"
          color="secondary"
          text-color="white"
          icon="person_add"
        />
        <h4 class="q-mt-md q-mb-xs text-weight-bold">Create Account</h4>
        <p class="text-grey-7 q-my-none">Join us today</p>
      </div>

      <!-- Signup Form -->
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Nickname -->
        <q-input
          v-model="nickname"
          label="Choose a Nickname"
          outlined
          class="rounded-borders"
          :rules="[(val) => !!val || 'Nickname is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
          <template v-slot:hint> This will be your display name </template>
        </q-input>

        <!-- PIN -->
        <q-input
          v-model="pin"
          label="Create PIN"
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
          <template v-slot:hint> Minimum 4 characters </template>
        </q-input>

        <!-- Confirm PIN -->
        <q-input
          v-model="confirmPin"
          label="Confirm PIN"
          outlined
          class="rounded-borders"
          :type="isPinVisible ? 'text' : 'password'"
          :rules="[
            (val) => !!val || 'Please confirm your PIN',
            (val) => val === pin || 'PINs do not match',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- Signup Button -->
        <q-btn
          type="submit"
          label="Sign Up"
          color="secondary"
          class="full-width rounded-borders q-py-sm"
          :loading="isLoading"
          unelevated
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>

        <!-- Link to Login -->
        <div class="text-center q-mt-md">
          <p class="q-mb-none text-grey-7">
            Already have an account?
            <router-link to="/auth/login" class="text-secondary text-weight-medium"
              >Log In</router-link
            >
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
    router.push('/auth/login') // navigate after successful signup
  }
}
</script>

<style scoped>
.signup-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .signup-card {
    width: 90%;
    margin: 0 16px;
  }
}
</style>
