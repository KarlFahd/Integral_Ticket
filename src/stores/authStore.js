import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const userRole = ref(null)

  function login(role) {
    isLoggedIn.value = true
    userRole.value = role
  }

  function logout() {
    isLoggedIn.value = false
    userRole.value = null
  }

  return { isLoggedIn, userRole, login, logout }
})
