<script setup>
import './ConfirmDialog.scss'
import { AlertTriangle } from 'lucide-vue-next'
import BaseButton from '../BaseButton/BaseButton.vue'

defineProps({
  visible:      { type: Boolean, default: false },
  title:        { type: String, default: 'Are you sure?' },
  message:      { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel:  { type: String, default: 'Cancel' },
  danger:       { type: Boolean, default: true },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="confirm-dialog__overlay" @click.self="emit('cancel')">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true">
        <div :class="['confirm-dialog__icon', danger ? 'confirm-dialog__icon--danger' : '']">
          <AlertTriangle :size="22" />
        </div>
        <h3 class="confirm-dialog__title">{{ title }}</h3>
        <p v-if="message" class="confirm-dialog__message">{{ message }}</p>
        <div class="confirm-dialog__actions">
          <BaseButton variant="secondary" class="confirm-dialog__cancel" @click="emit('cancel')">
            {{ cancelLabel }}
          </BaseButton>
          <BaseButton
            :variant="danger ? 'danger' : 'primary'"
            class="confirm-dialog__confirm"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
