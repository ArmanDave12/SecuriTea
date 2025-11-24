<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <transition name="dialog-content" appear>
      <q-card class="dialog-card">
        <q-toolbar class="custom-toolbar text-white mobile-toolbar">
          <q-btn flat round dense icon="arrow_back" v-close-popup @click="resetForm" />
          <q-toolbar-title class="text-body1">New Credential</q-toolbar-title>
          <q-btn flat dense label="Save" :disable="!isFormValid" @click="handleSave" />
        </q-toolbar>

        <q-card-section class="form-section">
          <q-form @submit="handleSave" class="form-container">
            <!-- Enhanced form fields with staggered animations -->
            <div class="form-field" :style="{ animationDelay: '0.1s' }">
              <q-select
                dense
                outlined
                v-model="form.platform"
                :options="extendedPlatformOptions"
                label="Platform (Optional)"
                class="platform-select custom-input"
                clearable
                option-label="title"
                option-value="name"
                emit-value
                map-options
                @update:model-value="onPlatformChange"
              >
                <template v-slot:prepend>
                  <q-icon name="category" class="input-icon" size="sm" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="platform-option">
                    <q-item-section avatar>
                      <div
                        class="platform-option-icon"
                        :style="{ backgroundColor: scope.opt.color }"
                      >
                        <q-icon :name="scope.opt.icon" color="white" size="18px" />
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ scope.opt.title }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <div class="row items-center no-wrap" v-if="scope.opt">
                    <div
                      class="selected-platform-icon"
                      :style="{ backgroundColor: scope.opt.color }"
                    >
                      <q-icon :name="scope.opt.icon" color="white" size="14px" />
                    </div>
                    <span class="q-ml-sm">{{ scope.opt.title }}</span>
                  </div>
                </template>
              </q-select>
            </div>

            <!-- Custom Platform Input (shows when "Other" is selected) -->
            <div
              v-if="showCustomPlatformInput"
              class="form-field custom-platform-field"
              :style="{ animationDelay: '0.15s' }"
            >
              <q-input
                dense
                outlined
                v-model="form.customPlatform"
                label="Custom Platform Name *"
                class="custom-input"
                :rules="[(val) => !!val || 'Platform name is required']"
                placeholder="Enter platform name..."
              >
                <template v-slot:prepend>
                  <q-icon name="edit" class="input-icon" size="sm" />
                </template>
              </q-input>
            </div>

            <div class="form-field" :style="{ animationDelay: '0.2s' }">
              <q-input
                dense
                outlined
                v-model="form.email"
                :label="requireEmail ? 'Email *' : 'Email'"
                class="custom-input"
                :rules="requireEmail ? [(val) => !!val || 'Email is required'] : []"
                type="email"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" class="input-icon" size="sm" />
                </template>
              </q-input>
            </div>

            <div class="form-field" :style="{ animationDelay: '0.3s' }">
              <q-input
                dense
                outlined
                v-model="form.username"
                :label="requireUsername ? 'Username *' : 'Username'"
                class="custom-input"
                :rules="requireUsername ? [(val) => !!val || 'Username is required'] : []"
              >
                <template v-slot:prepend>
                  <q-icon name="person" class="input-icon" size="sm" />
                </template>
              </q-input>
            </div>

            <div class="form-field" :style="{ animationDelay: '0.4s' }">
              <q-input
                dense
                outlined
                v-model="form.password"
                label="Password *"
                class="custom-input"
                :type="showPassword ? 'text' : 'password'"
                :rules="[(val) => !!val || 'Password is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" class="input-icon" size="sm" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer input-icon toggle-icon"
                    size="sm"
                    @click="togglePassword"
                  />
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </transition>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  platformOptions: {
    type: Array,
    default: () => [],
  },
  requireEmail: {
    type: Boolean,
    default: true,
  },
  requireUsername: {
    type: Boolean,
    default: false,
  },
  requirePassword: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'addCreds'])

// Form state
const form = ref({
  platform: '',
  customPlatform: '',
  email: '',
  username: '',
  password: '',
})

const showPassword = ref(false)
const showCustomPlatformInput = ref(false)

// Computed - Extended platform options with "Other"
const extendedPlatformOptions = computed(() => {
  const otherOption = {
    name: 'other',
    title: 'Other',
    icon: 'add_circle',
    color: '#6B7280',
  }
  return [...props.platformOptions, otherOption]
})

// Computed
const isFormValid = computed(() => {
  if (!form.value.password?.trim()) return false

  const hasEmail = form.value.email?.trim()
  const hasUsername = form.value.username?.trim()

  if (props.requireEmail && !hasEmail) return false
  if (props.requireUsername && !hasUsername) return false

  // If "other" is selected, require custom platform name
  if (form.value.platform === 'other' && !form.value.customPlatform?.trim()) return false

  if (!props.requireEmail && !props.requireUsername) {
    return hasEmail || hasUsername
  }

  return true
})

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const onPlatformChange = (value) => {
  showCustomPlatformInput.value = value === 'other'
  if (value !== 'other') {
    form.value.customPlatform = ''
  }
}

const resetForm = () => {
  form.value = {
    platform: '',
    customPlatform: '',
    email: '',
    username: '',
    password: '',
  }
  showPassword.value = false
  showCustomPlatformInput.value = false
}

const handleSave = () => {
  if (!isFormValid.value) return

  // Create a copy of the form data
  const formData = { ...form.value }

  // If "other" platform is selected, use the custom platform name
  if (formData.platform === 'other' && formData.customPlatform?.trim()) {
    formData.platform = formData.customPlatform.trim()
  } else if (formData.platform === 'other') {
    // If "other" is selected but no custom name provided, clear platform
    formData.platform = ''
  }

  // Remove the customPlatform field before emitting
  delete formData.customPlatform

  emit('addCreds', formData)
  resetForm()
}

// Watch for dialog close to reset form
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      resetForm()
    }
  },
)
</script>

<style scoped>
/* Enhanced page transitions */
.dialog-content-enter-active {
  animation: dialogSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Keyframes for transitions */
@keyframes dialogSlideUp {
  0% {
    transform: translateY(40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes formFieldSlide {
  0% {
    transform: translateY(20px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Enhanced dialogs */
.dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.custom-toolbar {
  background: linear-gradient(135deg, #008080 0%, #1e3a8a 100%) !important;
  min-height: 56px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-toolbar {
  min-height: 56px;
  padding: 8px 16px;
}

/* Enhanced form styling */
.form-section {
  padding: 24px 20px !important;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  animation: formFieldSlide 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.custom-platform-field {
  animation: customPlatformSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes customPlatformSlideIn {
  0% {
    transform: translateY(-10px) scale(0.98);
    opacity: 0;
    max-height: 0;
    margin-bottom: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
    max-height: 100px;
    margin-bottom: 20px;
  }
}

.custom-input {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.custom-input :deep(.q-field__control) {
  border-color: rgba(226, 232, 240, 0.8) !important;
  border-width: 2px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow:
    0 0 0 3px rgba(0, 128, 128, 0.15),
    0 4px 12px rgba(0, 128, 128, 0.1);
  background: #ffffff;
  transform: translateY(-1px);
}

.custom-input :deep(.q-field__label) {
  color: #64748b !important;
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

/* Platform select enhancements */
.platform-select :deep(.q-field__control) {
  border-radius: 12px !important;
  border-color: rgba(226, 232, 240, 0.8) !important;
  transition: all 0.3s ease;
}

.platform-select :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.15) !important;
}

.platform-option {
  padding: 12px 16px !important;
  transition: background 0.2s ease;
}

.platform-option:hover {
  background: rgba(0, 128, 128, 0.05) !important;
}

.platform-option-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.selected-platform-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-section {
    padding: 20px 16px !important;
  }
}

/* Dark mode enhancements */
.body--dark .custom-input :deep(.q-field__control) {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border-color: rgba(71, 85, 105, 0.6) !important;
}

.body--dark .custom-input :deep(.q-field--focused .q-field__control) {
  background: #334155 !important;
  border-color: rgba(16, 185, 129, 0.6) !important;
  box-shadow:
    0 0 0 3px rgba(16, 185, 129, 0.15),
    0 4px 12px rgba(16, 185, 129, 0.1) !important;
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

.body--dark .toggle-icon:hover {
  color: #10b981 !important;
}
</style>
