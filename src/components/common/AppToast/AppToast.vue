<script setup>
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToast } from '../../../composables/useToast.js'
import BaseIconButton from '../BaseIconButton/BaseIconButton.vue'

const { toasts, remove } = useToast()

const ICON = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', `toast--${t.type}`]"
          role="alert"
        >
          <component :is="ICON[t.type]" :size="18" class="toast__icon" />
          <span class="toast__message">{{ t.message }}</span>
          <BaseIconButton variant="ghost" size="sm" class="toast__close" @click="remove(t.id)" aria-label="Dismiss">
            <X :size="14" />
          </BaseIconButton>
          <div
            class="toast__progress"
            :style="{ animationDuration: `${t.duration}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 360px;
  width: 100%;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px 13px 12px;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08);
  pointer-events: all;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
  border-left: 4px solid transparent;
  background: var(--color-white);
  cursor: default;
}

.toast--success {
  border-color: #bbf7d0;
  border-left-color: #16a34a;
  background: color-mix(in srgb, var(--color-white) 90%, #16a34a 10%);
}
.toast--success .toast__icon { color: #16a34a; }
.toast--success .toast__progress { background: #16a34a; }

.toast--error {
  border-color: #fecaca;
  border-left-color: #dc2626;
  background: color-mix(in srgb, var(--color-white) 90%, #dc2626 10%);
}
.toast--error .toast__icon { color: #dc2626; }
.toast--error .toast__progress { background: #dc2626; }

.toast--info {
  border-color: #bfdbfe;
  border-left-color: #2563eb;
  background: color-mix(in srgb, var(--color-white) 90%, #2563eb 10%);
}
.toast--info .toast__icon { color: #2563eb; }
.toast--info .toast__progress { background: #2563eb; }

.toast--warning {
  border-color: #fde68a;
  border-left-color: #d97706;
  background: color-mix(in srgb, var(--color-white) 90%, #d97706 10%);
}
.toast--warning .toast__icon { color: #d97706; }
.toast--warning .toast__progress { background: #d97706; }

.toast__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast__message {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-dark);
  line-height: 1.4;
  padding-right: 6px;
}

/* Colors/hover live in BaseIconButton (variant="ghost") now — this just
   keeps its old compact footprint and slight optical alignment nudge. */
.toast__close {
  flex-shrink: 0;
  margin-top: -1px;
  margin-right: -2px;
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: shrink linear forwards;
  border-radius: 0 0 10px 10px;
  opacity: 0.6;
}

@keyframes shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* TransitionGroup animations */
.toast-enter-active { transition: all .3s cubic-bezier(.16,1,.3,1); }
.toast-leave-active { transition: all .25s ease; }
.toast-enter-from  { opacity: 0; transform: translateX(100%); }
.toast-leave-to    { opacity: 0; transform: translateX(120%); height: 0; margin: 0; padding: 0; }
</style>
