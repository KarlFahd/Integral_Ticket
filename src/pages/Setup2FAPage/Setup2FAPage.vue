<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { useSidebar } from '../../composables/useSidebar.js'
import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import { useAuthStore } from '../../stores/authStore.js'
import { authApi } from '../../services/authApi.js'

const router    = useRouter()
const authStore = useAuthStore()
const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()
// â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// 'idle' → 'qr' → 'confirm' → 'done' | 'active' (already enabled)
const step      = ref('idle')
const qrImage   = ref('')
const secret    = ref('')   // held locally — never sent to DB until confirmed
const code      = ref('')
const error     = ref('')
const loading   = ref(false)
const is2faOn   = ref(false)

// â”€â”€â”€ On mount: check current status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

onMounted(async () => {
  loading.value = true
  try {
    is2faOn.value = await authApi.get2faStatus(authStore.username)
    step.value    = is2faOn.value ? 'active' : 'idle'
  } catch {
    error.value = 'Could not load 2FA status.'
  } finally {
    loading.value = false
  }
})

// â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const generateQR = async () => {
  loading.value = true
  error.value   = ''
  try {
    const data   = await authApi.setup2fa(authStore.username)
    secret.value = data.secret  // kept in memory only
    qrImage.value = await QRCode.toDataURL(data.qr_url, { width: 220, margin: 2 })
    step.value   = 'qr'
  } catch {
    error.value = 'Could not generate QR code. Make sure you are logged in.'
  } finally {
    loading.value = false
  }
}

const confirmCode = async () => {
  error.value   = ''
  loading.value = true
  try {
    // The secret is sent here for the first (and only) time
    await authApi.enable2fa(authStore.username, secret.value, code.value)
    step.value  = 'done'
    is2faOn.value = true
  } catch (e) {
    error.value = e?.response?.data?.message || 'Invalid code. Please try again.'
    code.value  = ''
  } finally {
    loading.value = false
  }
}

const disable2fa = async () => {
  if (!confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) return
  loading.value = true
  error.value   = ''
  try {
    await authApi.disable2fa(authStore.username)
    is2faOn.value = false
    step.value    = 'idle'
    secret.value  = ''
    code.value    = ''
  } catch {
    error.value = 'Could not disable 2FA.'
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/overview')
}
</script>

<template>
  <div class="setup-2fa-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="setup-2fa-page__content">
      <AppHeader title="Two-Factor Authentication" subtitle="Secure your account" @toggle-sidebar="toggleSidebar" />

      <div class="s2fa-card">

        <!-- Loading -->
        <div v-if="loading && step === 'idle'" class="s2fa-loading">Loading…</div>

        <!-- â”€â”€ Already active â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <template v-else-if="step === 'active'">
          <div class="s2fa-icon">✅</div>
          <h2 class="s2fa-title">2FA is Active</h2>
          <p class="s2fa-text">
            Your account <strong>{{ authStore.username }}</strong> is protected with
            Microsoft Authenticator. Every login requires your 6-digit code.
          </p>
          <BaseButton variant="danger" :disabled="loading" @click="disable2fa">
            {{ loading ? 'Disabling…' : 'Disable 2FA' }}
          </BaseButton>
          <BaseButton variant="link" @click="goHome">← Back to dashboard</BaseButton>
        </template>

        <!-- â”€â”€ Idle: not yet set up â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <template v-else-if="step === 'idle'">
          <div class="s2fa-icon">🔐</div>
          <h2 class="s2fa-title">Set Up Two-Factor Authentication</h2>
          <p class="s2fa-text">
            Add an extra layer of security. You will need
            <strong>Microsoft Authenticator</strong> installed on your phone.
            Each account gets its own unique QR code.
          </p>
          <p v-if="error" class="s2fa-error">{{ error }}</p>
          <BaseButton :disabled="loading" @click="generateQR">
            {{ loading ? 'Generating…' : 'Generate My QR Code' }}
          </BaseButton>
          <BaseButton variant="link" @click="goHome">← Back to dashboard</BaseButton>
        </template>

        <!-- â”€â”€ QR code: scan it â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <template v-else-if="step === 'qr'">
          <div class="s2fa-icon">📱</div>
          <h2 class="s2fa-title">Scan This QR Code</h2>
          <p class="s2fa-text">
            Open <strong>Microsoft Authenticator</strong> → tap <strong>+</strong> →
            <strong>Work or school account</strong> → <strong>Scan QR code</strong>.
          </p>

          <img :src="qrImage" alt="QR code" class="s2fa-qr" />

          <p class="s2fa-manual-label">Can't scan? Enter this key manually in the app:</p>
          <code class="s2fa-secret">{{ secret }}</code>

          <p class="s2fa-note">
            This QR code is unique to <strong>{{ authStore.username }}</strong>.
            Other users have a completely different code.
          </p>

          <BaseButton @click="step = 'confirm'">
            I've scanned it — Next →
          </BaseButton>
          <BaseButton variant="link" @click="step = 'idle'">← Start over</BaseButton>
        </template>

        <!-- â”€â”€ Confirm: enter first code â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <template v-else-if="step === 'confirm'">
          <div class="s2fa-icon">🔢</div>
          <h2 class="s2fa-title">Enter the 6-Digit Code</h2>
          <p class="s2fa-text">
            Open Microsoft Authenticator — find <strong>Integra Chip</strong>
            — and type the 6-digit code shown right now.
          </p>

          <input
            v-model="code"
            class="s2fa-otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            autocomplete="one-time-code"
            autofocus
          />

          <p v-if="error" class="s2fa-error">{{ error }}</p>

          <BaseButton
            :disabled="loading || code.length !== 6"
            @click="confirmCode"
          >
            {{ loading ? 'Verifying…' : 'Activate 2FA' }}
          </BaseButton>
          <BaseButton variant="link" @click="step = 'qr'">← Back to QR code</BaseButton>
        </template>

        <!-- â”€â”€ Done â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <template v-else-if="step === 'done'">
          <div class="s2fa-icon">🎉</div>
          <h2 class="s2fa-title">2FA Activated!</h2>
          <p class="s2fa-text">
            From now on, every time <strong>{{ authStore.username }}</strong> logs in,
            Microsoft Authenticator will ask for a 6-digit code.
            Keep the app on your phone.
          </p>
          <BaseButton @click="goHome">Go to Dashboard</BaseButton>
        </template>

      </div>

    </main>

  </div>
</template>

<style scoped>
.setup-2fa-page {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

.setup-2fa-page__content {
  flex: 1;
  padding: 24px 32px;
}

.s2fa-card {
  max-width: 480px;
  margin: 32px auto 0;
  background: #fff;
  border-radius: 14px;
  padding: 44px 40px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}

.s2fa-loading {
  color: #9ca3af;
  font-size: 14px;
  padding: 24px 0;
}

.s2fa-icon   { font-size: 48px; line-height: 1; }

.s2fa-title  {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.s2fa-text   {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  max-width: 360px;
}

.s2fa-note {
  color: #7c3aed;
  font-size: 12px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 8px;
  padding: 8px 14px;
  margin: 0;
  max-width: 360px;
}

.s2fa-qr {
  border: 5px solid #f3f4f6;
  border-radius: 10px;
}

.s2fa-manual-label {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.s2fa-secret {
  font-family: monospace;
  font-size: 13px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 16px;
  letter-spacing: 3px;
  word-break: break-all;
  color: #374151;
}

.s2fa-otp {
  width: 180px;
  height: 60px;
  text-align: center;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  color: #111827;
  transition: border-color .15s;

  &:focus { border-color: #7c3aed; }
  &::placeholder { color: #d1d5db; letter-spacing: 4px; font-size: 22px; }
}

.s2fa-error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  width: 100%;
}

/* .s2fa-btn / .s2fa-back removed — visuals now live in BaseButton
   (variant="primary"/"danger" and variant="link"). */
</style>
