<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import './LoginForm.scss'
import { useRouter } from 'vue-router'

import BaseInput from '../../common/BaseInput/BaseInput.vue'
import BaseButton from '../../common/BaseButton/BaseButton.vue'
import googleLogo from '../../../assets/images/google-logo.svg'
import BasePasswordInput from '../../common/BasePasswordInput/BasePasswordInput.vue'
import { useAuthStore } from '../../../stores/authStore.js'

const usernameInput = ref('')
const password      = ref('')
const rememberMe    = ref(false)
const otpCode       = ref('')
const router        = useRouter()
const authStore     = useAuthStore()
const { isLoading, error, requires2fa } = storeToRefs(authStore)

const handleLogin = async () => {
  try {
    await authStore.login(usernameInput.value, password.value)
    if (!requires2fa.value) {
      router.push('/overview')
    }
    // If requires2fa is true the template will switch to the code input step
  } catch {
    // error message already set in the store
  }
}

const handleVerify2fa = async () => {
  try {
    await authStore.verify2fa(otpCode.value)
    router.push('/overview')
  } catch {
    otpCode.value = ''
  }
}

const goBackToLogin = () => {
  authStore.logout()
  otpCode.value = ''
}

// Auto-submit when the 6th digit is entered
watch(otpCode, (val) => {
  if (val.length === 6 && !isLoading.value) {
    handleVerify2fa()
  }
})
</script>

<template>
  <div class="login-form">

    <!-- ── STEP 1: Username + Password ─────────────────────── -->
    <template v-if="!requires2fa">
      <h2 class="login-form__title">Sign In</h2>
      <p class="login-form__subtitle">Enter your credentials to access your account</p>

      <form class="login-form__form" @submit.prevent="handleLogin">
        <BaseInput
          v-model="usernameInput"
          label="Username"
          placeholder="Enter your username..."
        />

        <BasePasswordInput
          v-model="password"
          label="Password"
          placeholder="Enter your password..."
        />

        <p v-if="error" class="login-form__error">{{ error }}</p>

        <div class="login-form__options">
          <label>
            <input v-model="rememberMe" type="checkbox" />
            Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </div>

        <BaseButton type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </BaseButton>

        <div class="login-form__separator">or continue with</div>

        <button type="button" class="login-form__google-button">
          <img :src="googleLogo" alt="Google" />
          <span>Sign In with Google</span>
        </button>
      </form>
    </template>

    <!-- ── STEP 2: Authenticator Code ─────────────────────── -->
    <template v-else>
      <div class="login-form__2fa-icon">🔐</div>
      <h2 class="login-form__title">Two-Factor Authentication</h2>
      <p class="login-form__subtitle">
        Open <strong>Microsoft Authenticator</strong> and enter the 6-digit code for
        <strong>Integra Chip</strong>.
      </p>

      <form class="login-form__form" @submit.prevent="handleVerify2fa">
        <div class="login-form__otp-group">
          <input
            v-model="otpCode"
            class="login-form__otp-input"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            autocomplete="one-time-code"
          />
        </div>

        <p v-if="error" class="login-form__error">{{ error }}</p>

        <BaseButton type="submit" :disabled="isLoading || otpCode.length !== 6">
          {{ isLoading ? 'Verifying...' : 'Verify Code' }}
        </BaseButton>

        <button type="button" class="login-form__back-link" @click="goBackToLogin">
          ← Back to login
        </button>
      </form>
    </template>

  </div>
</template>
