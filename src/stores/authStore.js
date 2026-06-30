import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/authApi.js'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref(null)
  const isLoading   = ref(false)
  const error       = ref(null)

  // Holds the username between password step and 2FA step
  const pending2faUsername = ref(null)

  const isLoggedIn  = computed(() => user.value !== null)
  const isAdmin     = computed(() => user.value?.is_admin ?? false)   // true = agent/admin
  const isHr        = computed(() => user.value?.is_hr    ?? false)   // true = HR employee
  const username    = computed(() => user.value?.username ?? '')
  const requires2fa = computed(() => pending2faUsername.value !== null)

  async function login(username, password) {
    isLoading.value = true
    error.value     = null
    try {
      const result = await authApi.login(username, password)
      if (result.requires_2fa) {
        pending2faUsername.value = result.username
        // Don't set user yet — wait for 2FA verification
      } else {
        user.value               = result.user
        pending2faUsername.value = null
      }
    } catch (e) {
      error.value = 'Invalid username or password.'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function verify2fa(code) {
    isLoading.value = true
    error.value     = null
    try {
      const loggedInUser       = await authApi.verify2fa(pending2faUsername.value, code)
      user.value               = loggedInUser
      pending2faUsername.value = null
    } catch (e) {
      error.value = 'Invalid authenticator code. Please try again.'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value               = null
    error.value              = null
    pending2faUsername.value = null
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    isHr,
    username,
    requires2fa,
    isLoading,
    error,
    pending2faUsername,
    login,
    verify2fa,
    logout,
  }
})
