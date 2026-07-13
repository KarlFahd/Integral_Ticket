<script setup>
import './IntegralBot.scss'

import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { X, Send, Bot } from 'lucide-vue-next'
import { useBotStore } from '../../../stores/botStore.js'
import { useAuthStore } from '../../../stores/authStore.js'
import { useThemeStore } from '../../../stores/themeStore.js'

const router     = useRouter()
const botStore   = useBotStore()
const authStore  = useAuthStore()
const themeStore = useThemeStore()

const inputText  = ref('')
const listRef     = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => botStore.messages.length, scrollToBottom)
watch(() => botStore.isOpen, (open) => { if (open) scrollToBottom() })

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
  inputText.value = ''

  const actions = await botStore.sendMessage(text, {
    username: authStore.username,
    isAdmin:  authStore.isAdmin,
    isHr:     authStore.isHr,
  })
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
      <button class="integral-bot__close" @click="botStore.close">
        <X :size="18" />
      </button>
    </div>

    <div ref="listRef" class="integral-bot__list">
      <div
        v-for="(m, i) in botStore.messages"
        :key="i"
        class="integral-bot__bubble"
        :class="`integral-bot__bubble--${m.role}`"
      >
        {{ m.content }}
      </div>

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
      <button
        type="submit"
        class="integral-bot__send"
        :disabled="botStore.isLoading || !inputText.trim()"
      >
        <Send :size="16" />
      </button>
    </form>
  </div>
</template>
