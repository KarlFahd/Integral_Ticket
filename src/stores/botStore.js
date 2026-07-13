import { defineStore } from 'pinia'
import { ref } from 'vue'
import { botApi } from '../services/botApi.js'

const WELCOME_MESSAGE = "Hi, I'm Integral Bot. Ask me to create a ticket, check on one, or open a page for you."

export const useBotStore = defineStore('bot', () => {
  const isOpen    = ref(false)
  const isLoading = ref(false)
  const error     = ref(null)
  const messages  = ref([{ role: 'assistant', content: WELCOME_MESSAGE }])

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function close() {
    isOpen.value = false
  }

  function reset() {
    messages.value = [{ role: 'assistant', content: WELCOME_MESSAGE }]
    error.value = null
    isOpen.value = false
  }

  // Returns the `actions` array from the reply so the caller (which has
  // access to the router/theme store) can apply them.
  async function sendMessage(text, { username, isAdmin, isHr }) {
    const trimmed = text.trim()
    if (!trimmed || isLoading.value) return []

    messages.value.push({ role: 'user', content: trimmed })
    isLoading.value = true
    error.value = null

    try {
      const { reply, actions } = await botApi.chat({
        messages: messages.value,
        username,
        isAdmin,
        isHr,
      })
      messages.value.push({ role: 'assistant', content: reply })
      return actions ?? []
    } catch (e) {
      error.value = 'Integral Bot is unavailable right now.'
      messages.value.push({ role: 'assistant', content: "Sorry, I couldn't reach the server. Please try again." })
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    isOpen,
    isLoading,
    error,
    messages,
    toggle,
    close,
    reset,
    sendMessage,
  }
})
