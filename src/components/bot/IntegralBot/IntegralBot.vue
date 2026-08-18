<script setup>
import './IntegralBot.scss'

import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { X, Send, Bot } from 'lucide-vue-next'
import { useBotStore } from '../../../stores/botStore.js'
import { useAuthStore } from '../../../stores/authStore.js'
import { useThemeStore } from '../../../stores/themeStore.js'
import BaseIconButton from '../../common/BaseIconButton/BaseIconButton.vue'

const router     = useRouter()
const botStore   = useBotStore()
const authStore  = useAuthStore()
const themeStore = useThemeStore()

const inputText = ref('')
const listRef   = ref(null)

function scrollToBottom() {
  // nextTick: wait for Vue to finish rendering the new message bubble before
  // scrolling, otherwise scrollHeight hasn't grown yet and the scroll lands short.
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

// Auto-scroll when a new message is added (user message OR bot reply).
watch(() => botStore.messages.length, scrollToBottom)
// Scroll to the latest message when the panel is re-opened.
watch(() => botStore.isOpen, (open) => { if (open) scrollToBottom() })

/**
 * Applies the non-standard "action" payloads returned by the MCP tools.
 *
 * MCP's spec only lets tools return text. Our app extended the response shape
 * with an "action" field for instructions that need to happen IN the browser
 * (navigating to a page, switching the theme). BotService collects these across
 * the whole agentic loop and returns them alongside the final text reply.
 * This function is the frontend side of that custom extension.
 *
 * Supported action types:
 *   { type: 'navigate', path: '/some-route' }  → router.push(path)
 *   { type: 'theme',    mode: 'dark'|'light' } → themeStore.setDark(...)
 */
function applyActions(actions) {
  for (const action of actions) {
    if (action.type === 'navigate' && action.path) {
      router.push(action.path)
    } else if (action.type === 'theme' && action.mode) {
      themeStore.setDark(action.mode === 'dark')
    }
  }
}

async function handleSend() {
  const text = inputText.value
  if (!text.trim() || botStore.isLoading) return

  // Clear the input immediately so the user can type the next message
  // while the bot is still processing (good UX; the store is the source of truth).
  inputText.value = ''

  // sendMessage() returns the array of actions collected during the agentic loop.
  // We pass the current user's identity so the backend can scope tool results
  // (e.g. employees only see their own tickets, HR/Admin get extra tools).
  const actions = await botStore.sendMessage(text, {
    username: authStore.username,
    isAdmin:  authStore.isAdmin,
    isHr:     authStore.isHr,
  })

  // Execute any side-channel instructions from the tools (navigate, theme).
  applyActions(actions)
}
</script>

<template>
  <div v-if="botStore.isOpen" class="integral-bot">
    <div class="integral-bot__header">
      <div class="integral-bot__title">
        <Bot :size="18" />
        <span>Integral Bot</span>
      </div>
      <BaseIconButton variant="inverse" class="integral-bot__close" @click="botStore.close">
        <X :size="18" />
      </BaseIconButton>
    </div>

    <!-- Message list: each bubble is role-styled (user = right, assistant = left) -->
    <div ref="listRef" class="integral-bot__list">
      <div
        v-for="(m, i) in botStore.messages"
        :key="i"
        class="integral-bot__bubble"
        :class="`integral-bot__bubble--${m.role}`"
      >
        {{ m.content }}
      </div>

      <!-- Typing indicator: three animated dots while waiting for the bot reply -->
      <div v-if="botStore.isLoading" class="integral-bot__bubble integral-bot__bubble--assistant integral-bot__typing">
        <span></span><span></span><span></span>
      </div>
    </div>

    <form class="integral-bot__input-row" @submit.prevent="handleSend">
      <input
        v-model="inputText"
        class="integral-bot__input"
        type="text"
        placeholder="Ask Integral Bot..."
        :disabled="botStore.isLoading"
      />
      <BaseIconButton
        type="submit"
        variant="solid"
        class="integral-bot__send"
        :disabled="botStore.isLoading || !inputText.trim()"
      >
        <Send :size="16" />
      </BaseIconButton>
    </form>
  </div>
</template>
