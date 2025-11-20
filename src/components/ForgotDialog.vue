<template>
  <q-dialog :model-value="forgotPinDialog" persistent @update:model-value="$emit('close')">
    <div class="forgot-pin-popup">
      <div class="popup-icon">🔑</div>
      <div class="popup-title">PIN Recovery</div>
      <div class="popup-text">
        Contact your administrator for PIN recovery assistance for account:
        <strong>{{
          selectedAccount?.nickname || selectedAccount?.username || 'your account'
        }}</strong>
      </div>

      <div class="security-tips">
        <div class="tip-title">Recovery Options:</div>
        <ul class="tip-list">
          <li>Check your password manager</li>
          <li>Contact system administrator</li>
          <li>Use backup recovery method</li>
        </ul>
      </div>

      <div class="popup-actions">
        <q-btn
          color="primary"
          label="OK"
          @click="$emit('close')"
          rounded
          no-caps
          class="action-btn-dialog"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
defineProps({
  forgotPinDialog: {
    type: Boolean,
    default: false,
  },
  selectedAccount: {
    type: Object,
    default: null,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.forgot-pin-popup {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  min-width: 300px;
  max-width: 85vw;
  border: 1px solid #94a3b8;
}

.popup-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #475569;
}

.popup-text {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.5;
}

.security-tips {
  text-align: left;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 6px;
}

.tip-list {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  color: #64748b;
}

.tip-list li {
  margin-bottom: 3px;
}

.popup-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.action-btn-dialog {
  min-width: 100px;
  font-weight: 600;
}

/* Dark mode */
.body--dark .forgot-pin-popup {
  background: #1f2937;
  border-color: #374151;
}

.body--dark .popup-title {
  color: #e5e7eb;
}

.body--dark .popup-text {
  color: #9ca3af;
}
</style>
