<template>
  <q-dialog v-model="showDialog" position="bottom" @hide="$emit('close')">
    <q-card class="about-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="app-branding">
          <q-avatar size="48px" class="app-logo">
            <img src="src/assets/SecuriTea.png" alt="SecuriTea Logo" />
          </q-avatar>
          <div class="app-info">
            <h2 class="app-name">SecuriTea</h2>
          </div>
        </div>
        <q-btn flat round dense icon="close" @click="closeDialog" class="dialog-close" />
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <!-- App Description -->
        <div class="description-section">
          <p class="app-description">
            SecuriTea is your trusted security companion — a secure, intuitive, and lightweight
            password manager built for everyday use. Protect your sensitive information with a
            personal PIN or fingerprint authentication, safely store your credentials, and manage
            your profile effortlessly. Designed with a clean interface and mobile-friendly layout,
            SecuriTea ensures strong security without sacrificing simplicity.
          </p>
        </div>

        <!-- Key Features -->
        <div class="features-section">
          <h3 class="section-title">
            <q-icon name="star" size="16px" class="title-icon" />
            Key Features
          </h3>

          <div class="features-grid">
            <div class="feature-item">
              <q-icon name="fingerprint" size="20px" class="feature-icon security-color" />
              <div class="feature-content">
                <span class="feature-title">Biometric Security</span>
                <span class="feature-desc">PIN & fingerprint authentication</span>
              </div>
            </div>

            <div class="feature-item">
              <q-icon name="lock" size="20px" class="feature-icon security-color" />
              <div class="feature-content">
                <span class="feature-title">Secure Storage</span>
                <span class="feature-desc">Encrypted credential management</span>
              </div>
            </div>

            <div class="feature-item">
              <q-icon name="phone_android" size="20px" class="feature-icon preferences-color" />
              <div class="feature-content">
                <span class="feature-title">Mobile-First</span>
                <span class="feature-desc">Optimized for touch devices</span>
              </div>
            </div>

            <div class="feature-item">
              <q-icon name="palette" size="20px" class="feature-icon preferences-color" />
              <div class="feature-content">
                <span class="feature-title">Clean Interface</span>
                <span class="feature-desc">Intuitive and user-friendly</span>
              </div>
            </div>

            <!-- <div class="feature-item">
              <q-icon name="sync" size="20px" class="feature-icon account-color" />
              <div class="feature-content">
                <span class="feature-title">Data Sync</span>
                <span class="feature-desc">Backup & synchronization</span>
              </div>
            </div> -->

            <div class="feature-item">
              <q-icon name="speed" size="20px" class="feature-icon account-color" />
              <div class="feature-content">
                <span class="feature-title">Lightweight</span>
                <span class="feature-desc">Fast and efficient performance</span>
              </div>
            </div>
          </div>
        </div>

        <!-- App Info -->
        <div class="info-section">
          <h3 class="section-title">
            <q-icon name="info_outline" size="16px" class="title-icon" />
            App Information
          </h3>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Version</span>
              <span class="info-value">1.0.0</span>
            </div>

            <div class="info-item">
              <span class="info-label">Build</span>
              <span class="info-value">2024.11.001</span>
            </div>

            <div class="info-item">
              <span class="info-label">Platform</span>
              <span class="info-value">Mobile & Web</span>
            </div>

            <div class="info-item">
              <span class="info-label">Framework</span>
              <span class="info-value">Vue 3 + Quasar</span>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <div class="notice-header">
            <q-icon name="security" size="18px" class="notice-icon" />
            <span class="notice-title">Security Promise</span>
          </div>
          <p class="notice-text">
            Your data is encrypted and stored locally on your device. SecuriTea never transmits your
            passwords or sensitive information to external servers without your explicit consent.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <div class="copyright">
          <q-icon name="copyright" size="14px" />
          <span>2024 SecuriTea. All rights reserved.</span>
        </div>

        <div class="footer-links">
          <q-btn
            flat
            dense
            size="sm"
            label="Privacy Policy"
            @click="openPrivacyPolicy"
            class="footer-link"
          />
          <q-btn
            flat
            dense
            size="sm"
            label="Terms of Service"
            @click="openTermsOfService"
            class="footer-link"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'close'])

// Computed for v-model support
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Methods
function closeDialog() {
  emit('update:modelValue', false)
  emit('close')
}

function openPrivacyPolicy() {
  $q.notify({
    color: 'info',
    message: '🚧 Privacy Policy page is under construction',
    icon: 'construction',
    position: 'top',
  })
}

function openTermsOfService() {
  $q.notify({
    color: 'info',
    message: '🚧 Terms of Service page is under construction',
    icon: 'construction',
    position: 'top',
  })
}
</script>

<style scoped>
/* About Dialog Styles */
.about-dialog {
  width: 100%;
  max-width: none;
  margin: 0;
  border-radius: 20px 20px 0 0;
  background: white;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #003366 0%, #004080 100%);
  color: white;
}

.app-branding {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  background: linear-gradient(135deg, #008080, #ff8c42);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: 25px;
  font-weight: 800;
  margin: 0;
  color: white;
  letter-spacing: -0.3px;
}

.version-badge {
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 140, 66, 0.2);
  color: #ff8c42;
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;
}

.dialog-close {
  color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
}

.dialog-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Content */
.dialog-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  background: white;
}

/* Description Section */
.description-section {
  text-align: center;
  background: rgba(248, 250, 252, 0.8);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.app-description {
  font-size: 14px;
  line-height: 1.6;
  color: #0f172a;
  margin: 0;
  font-weight: 500;
}

/* Section Titles */
.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #003366;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.title-icon {
  color: #008080;
}

/* Features Section - High Contrast */
.features-section {
  background: rgba(248, 250, 252, 0.95);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: white;
  border-radius: 12px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  flex-shrink: 0;
}

.security-color {
  color: #008080;
}

.preferences-color {
  color: #ff8c42;
}

.account-color {
  color: #7cb342;
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.feature-desc {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  line-height: 1.3;
}

/* Info Section - High Contrast */
.info-section {
  background: rgba(248, 250, 252, 0.95);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: white;
  border-radius: 10px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

/* Security Notice - High Contrast */
.security-notice {
  background: rgba(0, 128, 128, 0.08);
  border-radius: 16px;
  padding: 18px;
  border: 2px solid rgba(0, 128, 128, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.notice-icon {
  color: #008080;
  flex-shrink: 0;
}

.notice-title {
  font-size: 14px;
  font-weight: 700;
  color: #003366;
}

.notice-text {
  font-size: 12px;
  line-height: 1.5;
  color: #0f172a;
  margin: 0;
  font-weight: 500;
}

/* Footer */
.dialog-footer {
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.95);
  border-top: 2px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.copyright {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #475569;
  font-weight: 600;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  font-size: 11px;
  color: #008080;
  font-weight: 700;
  padding: 6px 12px;
  min-height: auto;
  border: 1px solid rgba(0, 128, 128, 0.2);
  border-radius: 8px;
}

.footer-link:hover {
  background: rgba(0, 128, 128, 0.1);
  color: #003366;
}

/* Tablet Optimizations (768px+) */
@media (min-width: 768px) {
  .about-dialog {
    width: 600px;
    max-width: 90vw;
    margin: auto;
    border-radius: 20px;
    max-height: 80vh;
  }

  .dialog-header {
    padding: 24px;
  }

  .dialog-content {
    padding: 24px;
    gap: 28px;
  }

  .features-grid {
    grid-template-columns: 1fr 1fr;
  }

  .app-description {
    font-size: 15px;
  }

  .dialog-footer {
    padding: 20px 24px;
  }
}

/* Desktop Optimizations (1024px+) */
@media (min-width: 1024px) {
  .about-dialog {
    width: 700px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Very Small Screens */
@media (max-width: 350px) {
  .dialog-header {
    padding: 16px;
  }

  .dialog-content {
    padding: 16px;
    gap: 20px;
  }

  .features-section,
  .info-section {
    padding: 16px;
  }

  .app-name {
    font-size: 18px;
  }

  .app-description {
    font-size: 13px;
  }

  .feature-title {
    font-size: 13px;
  }

  .feature-desc {
    font-size: 11px;
  }
}

/* Safe area for devices with notches */
@supports (padding: env(safe-area-inset-bottom)) {
  .dialog-footer {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}
</style>
