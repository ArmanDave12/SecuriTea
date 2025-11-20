<template>
  <q-dialog :model-value="accountLockedDialog" persistent @update:model-value="$emit('close')">
    <div class="account-locked-popup">
      <div class="popup-icon">🔒</div>
      <div class="popup-title">Account Locked</div>
      <div class="popup-text">
        Account <strong>{{ selectedAccount?.nickname || selectedAccount?.username }}</strong> has
        been temporarily locked due to multiple failed PIN attempts.
      </div>

      <div class="lockout-info">
        <div class="info-item">
          <q-icon name="schedule" size="16px" />
          <span>Lockout: {{ Math.ceil(lockTimeLeft / 1000) }}s</span>
        </div>
        <div class="info-item">
          <q-icon name="security" size="16px" />
          <span>Failed: {{ maxAttempts }} attempts</span>
        </div>
      </div>

      <div class="popup-actions">
        <q-btn
          flat
          color="grey-6"
          label="Wait"
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
  accountLockedDialog: {
    type: Boolean,
    default: false,
  },
  selectedAccount: {
    type: Object,
    default: null,
  },
  lockTimeLeft: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.account-locked-popup {
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

.lockout-info {
  text-align: left;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #dc2626;
}

.info-item:last-child {
  margin-bottom: 0;
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
.body--dark .account-locked-popup {
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
