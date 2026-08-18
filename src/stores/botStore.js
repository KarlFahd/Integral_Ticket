import { defineStore } from 'pinia'
import { ref } from 'vue'
import { botApi } from '../services/botApi.js'

const WELCOME_MESSAGE = "Hi, I'm Integral Bot. Ask me to create a ticket, check on one, or open a page for you."

export const useBotStore = defineStore('bot', () => {
  const isOpen    = ref(false)
  const isLoading = ref(false)
  const error     = ref(null)

  // The full conversation history, sent to the backend on every message so
  // Gemini has context for its reply (e.g. "which ticket did I just mention?").
  // Format: [{ role: 'user'|'assistant', content: string }, ...]
  // Note: 'assistant' here is our app's convention — the backend renames it
  // to 'model' before forwarding to Gemini (see BotService::toGeminiContents).
  const messages = ref([{ role: 'assistant', content: WELCOME_MESSAGE }])

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function close() {
    isOpen.value = false
  }

  function reset() {
    messages.value = [{ role: 'assistant', content: WELCOME_MESSAGE }]
    error.value    = null
    isOpen.value   = false
  }

  /**
   * Send a user message and return the actions array from the reply.
   *
   * Why return actions instead of applying them here?
   * The store has no access to the Vue Router or the theme store — those are
   * UI/framework concerns. The component (IntegralBot.vue) owns those
   * dependencies and calls applyActions() after sendMessage() resolves.
   *
   * Full call chain:
   *   sendMessage() → botApi.chat() → POST /api/bot/chat
   *   → BotService (agentic loop: Gemini ↔ MCP tools)
   *   → { reply: string, actions: [{type, ...}] }
   */
  async function sendMessage(text, { username, isAdmin, isHr }) {
    const trimmed = text.trim()
    if (!trimmed || isLoading.value) return []

    // Push user message immediately so it appears in the chat while we wait.
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

      // Return the actions list so the component can apply them (navigate, theme).
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
