<template>
  <q-dialog v-model="isOpen" position="bottom">
    <q-card class="dialog-card">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-subtitle1">Password Generator</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-card-section class="q-py-sm">
        <!-- Base Input Field -->
        <div class="form-field">
          <q-input
            dense
            outlined
            v-model="passwordBase"
            label="Password Base (Optional)"
            placeholder="e.g., @dave.lofer_"
            class="base-input"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" class="input-icon" size="xs" />
            </template>
            <template v-slot:hint>
              Base text that will be combined with platform variations
            </template>
          </q-input>
        </div>

        <!-- Platform Selection -->
        <div class="form-field" v-if="passwordBase">
          <q-select
            dense
            outlined
            v-model="selectedPlatform"
            :options="platformOptions"
            label="Platform for Base Combination (Optional)"
            class="platform-select"
            clearable
            option-label="title"
            option-value="name"
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="category" class="input-icon" size="xs" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="platform-option">
                <q-item-section avatar>
                  <div class="platform-option-icon" :style="{ backgroundColor: scope.opt.color }">
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
                <div class="selected-platform-icon" :style="{ backgroundColor: scope.opt.color }">
                  <q-icon :name="scope.opt.icon" color="white" size="14px" />
                </div>
                <span class="q-ml-sm">{{ scope.opt.title }}</span>
              </div>
            </template>
          </q-select>
        </div>

        <div class="generated-password">
          {{ generatedPassword }}
        </div>

        <!-- Toggle for Random vs Base Mode -->
        <div class="generation-mode q-mt-sm">
          <q-toggle
            v-model="useBaseGeneration"
            :label="useBaseGeneration ? 'Base + Platform Mode' : 'Random Password Mode'"
            class="mode-toggle"
            :disable="!passwordBase"
          />
        </div>

        <!-- Show random options only when not using base generation -->
        <div v-if="!useBaseGeneration" class="password-options q-mt-sm">
          <q-toggle
            dense
            v-model="localOptions.uppercase"
            label="A-Z"
            class="custom-toggle"
            @update:model-value="onOptionsChange"
          />
          <q-toggle
            dense
            v-model="localOptions.lowercase"
            label="a-z"
            class="custom-toggle"
            @update:model-value="onOptionsChange"
          />
          <q-toggle
            dense
            v-model="localOptions.numbers"
            label="0-9"
            class="custom-toggle"
            @update:model-value="onOptionsChange"
          />
          <q-toggle
            dense
            v-model="localOptions.symbols"
            label="#$@!"
            class="custom-toggle"
            @update:model-value="onOptionsChange"
          />
        </div>

        <q-slider
          v-if="!useBaseGeneration"
          v-model="localOptions.length"
          :min="8"
          :max="32"
          label
          label-always
          class="custom-slider q-mt-sm"
          @update:model-value="onOptionsChange"
        />
      </q-card-section>

      <q-card-actions align="between" class="q-px-sm q-py-xs">
        <q-btn
          flat
          class="generator-btn"
          icon="refresh"
          label="Generate"
          size="sm"
          @click="generatePassword"
        />
        <q-btn
          flat
          class="generator-btn"
          icon="content_copy"
          label="Copy"
          size="sm"
          @click="copyGeneratedPassword"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { socMeds } from 'src/composables/usePlatforms'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value &&
        typeof value.length === 'number' &&
        typeof value.uppercase === 'boolean' &&
        typeof value.lowercase === 'boolean' &&
        typeof value.numbers === 'boolean' &&
        typeof value.symbols === 'boolean'
      )
    },
  },
  generatedPassword: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:modelValue',
  'update:options',
  'update:generatedPassword',
  'password-generated',
  'password-copied',
])

const $q = useQuasar()

// Local reactive copy of options to avoid direct prop mutation
const localOptions = ref({ ...props.options })

// New reactive variables for base generation
const passwordBase = ref('')
const selectedPlatform = ref('')
const useBaseGeneration = ref(false)

// Platform options for dropdown
const platformOptions = computed(() => socMeds)

// Computed property for dialog visibility
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Watch for external options changes
watch(
  () => props.options,
  (newOptions) => {
    localOptions.value = { ...newOptions }
  },
  { deep: true },
)

const onOptionsChange = () => {
  // Emit the updated options to parent
  emit('update:options', { ...localOptions.value })
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

const generatePassword = () => {
  // If using base generation and we have a base
  if (useBaseGeneration.value && passwordBase.value) {
    const password = generateBasePassword()
    emit('update:generatedPassword', password)
    emit('password-generated', password)
    return
  }

  // Default random password generation
  const options = localOptions.value

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?'

  let chars = ''
  if (options.uppercase) chars += uppercaseChars
  if (options.lowercase) chars += lowercaseChars
  if (options.numbers) chars += numberChars
  if (options.symbols) chars += symbolChars

  if (!chars) chars = lowercaseChars

  let password = ''
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    password += chars[randomIndex]
  }

  // Emit the new password to parent
  emit('update:generatedPassword', password)
  emit('password-generated', password)
}

const generateBasePassword = () => {
  const base = passwordBase.value

  if (!selectedPlatform.value) {
    // Just return base with some random numbers/symbols
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    return `${base}${randomSuffix}`
  }

  const platform = socMeds.find((p) => p.name === selectedPlatform.value)
  if (!platform) return base

  const platformName = platform.title

  // Create various creative combinations
  const variations = [
    // Basic platform name variations
    `${base}${platformName}`,
    `${base}${platformName.toLowerCase()}`,
    `${base}${capitalizeFirst(platformName.toLowerCase())}`,

    // With numbers
    `${base}${platformName}123`,
    `${base}${platformName.toLowerCase()}2024`,
    `${base}${replaceLettersWithNumbers(platformName)}`,

    // Creative combinations
    `${base}${platformName.charAt(0).toUpperCase()}${platformName.slice(1).toLowerCase()}`,
    `${base}${reverseString(platformName.toLowerCase())}`,
    `${base}${platformName.toUpperCase()}!`,

    // Mixed case with symbols
    `${base}${mixCase(platformName)}@`,
    `${base}${platformName.toLowerCase()}_2024`,
    `${base}${abbreviate(platformName)}123`,

    // Special combinations
    `${base}${platformName.charAt(0)}${platformName.charAt(-1)}${Math.floor(Math.random() * 100)}`,
    `${base}${leetSpeak(platformName.toLowerCase())}`,
    `${base}${platformName.slice(0, 4)}${Math.floor(Math.random() * 1000)}`,
  ]

  // Return a random variation
  return variations[Math.floor(Math.random() * variations.length)]
}

// Helper functions for creative password generation
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const replaceLettersWithNumbers = (str) => {
  return str
    .toLowerCase()
    .replace(/o/g, '0')
    .replace(/i/g, '1')
    .replace(/e/g, '3')
    .replace(/a/g, '@')
    .replace(/s/g, '5')
    .replace(/t/g, '7')
}

const reverseString = (str) => str.split('').reverse().join('')

const mixCase = (str) => {
  return str
    .split('')
    .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
    .join('')
}

const abbreviate = (str) => {
  // Take first letter of each word, or first 3-4 letters if single word
  const words = str.split(' ')
  if (words.length > 1) {
    return words.map((word) => word.charAt(0).toUpperCase()).join('')
  }
  return str.substring(0, Math.min(4, str.length))
}

const leetSpeak = (str) => {
  return str
    .replace(/a/g, '@')
    .replace(/e/g, '3')
    .replace(/i/g, '1')
    .replace(/o/g, '0')
    .replace(/s/g, '5')
    .replace(/t/g, '7')
    .replace(/l/g, '1')
}

const copyGeneratedPassword = () => {
  const password = props.generatedPassword

  navigator.clipboard
    .writeText(password || '')
    .then(() => {
      emit('update:modelValue', false)
      emit('password-copied', password)

      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Password copied to clipboard',
        icon: 'check',
      })
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Failed to copy password',
        icon: 'error',
      })
    })
}

// Generate initial password when component is created
generatePassword()
</script>

<style scoped>
/* Enhanced dialogs */
.dialog-card {
  width: 100%;
  max-width: 100%;
  border-radius: 16px 16px 0 0;
}

/* Password Generator */
.generated-password {
  font-family: monospace;
  font-size: 16px;
  background: linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  overflow-wrap: break-word;
  border: 1px solid #008080;
  color: #008080;
  font-weight: 500;
}

.password-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
}

.custom-toggle :deep(.q-toggle__inner) {
  color: #008080 !important;
}

.custom-slider :deep(.q-slider__track) {
  background: #008080 !important;
}

.generator-btn {
  color: #008080 !important;
}

/* New styles for base generation */
.form-field {
  margin-bottom: 16px;
}

.base-input :deep(.q-field__control) {
  border-color: #e2e8f0 !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.base-input :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1) !important;
}

.platform-select :deep(.q-field__control) {
  border-radius: 12px !important;
  border-color: #e2e8f0 !important;
  transition: all 0.3s ease;
}

.platform-select :deep(.q-field--focused .q-field__control) {
  border-color: #008080 !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.1) !important;
}

.platform-option {
  padding: 12px 16px !important;
}

.platform-option-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selected-platform-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon {
  color: #64748b !important;
}

.generation-mode {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.mode-toggle :deep(.q-toggle__inner) {
  color: #008080 !important;
}

.mode-toggle :deep(.q-toggle__label) {
  font-weight: 500;
  color: #374151 !important;
}
</style>
