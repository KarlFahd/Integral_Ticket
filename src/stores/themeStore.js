import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'theme'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem(STORAGE_KEY) === 'dark')

  function apply() {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  // Call once on app startup to sync the DOM with the persisted preference.
  function init() {
    apply()
  }

  function setDark(value) {
    isDark.value = value
    localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light')
    apply()
  }

  function toggle() {
    setDark(!isDark.value)
  }

  return { isDark, init, setDark, toggle }
})
