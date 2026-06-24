<script setup>
import { ref } from 'vue'

import './LoginForm.scss'
import { useRouter } from 'vue-router'

import BaseInput from '../../common/BaseInput/BaseInput.vue'
import BaseButton from '../../common/BaseButton/BaseButton.vue'
import googleLogo from '../../../assets/images/google-logo.svg'
import BasePasswordInput from '../../common/BasePasswordInput/BasePasswordInput.vue'
import { useAuthStore } from '../../../stores/authStore.js'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const AGENT_CREDENTIALS = [
  { username: 'k', password: 'k' },
  { username: 'admin', password: 'admin' },
]

const handleLogin = () => {
  const isAgent = AGENT_CREDENTIALS.some(
    c => c.username === username.value && c.password === password.value
  )
  const role = isAgent ? 'agent' : 'client'
  authStore.login(role)
  router.push(isAgent ? '/agent-dashboard' : '/dashboard')
}

</script>

<template>
  <div class="login-form">
    <h2 class="login-form__title">
      Sign In
    </h2>

    <p class="login-form__subtitle">
      Enter your credential to access your account
    </p>

    <form
      class="login-form__form"
      @submit.prevent="handleLogin"
    >
      <BaseInput
        v-model="username"
        label="Username"
        placeholder="Enter your username..."
      />

<BasePasswordInput
  v-model="password"
  label="Password"
  placeholder="Enter your password..."
/>

      <div class="login-form__options">
        <label>
          <input
            v-model="rememberMe"
            type="checkbox"
          />
          Remember me
        </label>

        <a href="#">
          Forgot Password?
        </a>
      </div>

      <BaseButton
        text="Sign In"
        type="submit"
        @click="handleLogin"
      />

      <div class="login-form__separator">
        or continue with
      </div>
<button
  type="button"
  class="login-form__google-button"
>
  <img
    :src="googleLogo"
    alt="Google"
  />

  <span>Sign In with Google</span>
</button>
    </form>
  </div>
</template>