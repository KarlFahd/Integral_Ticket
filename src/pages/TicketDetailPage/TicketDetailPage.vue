<script setup>
import './TicketDetailPage.scss'

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Paperclip,
  Send,
} from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseSearchInput from '../../components/common/BaseSearchInput/BaseSearchInput.vue'
import TicketSummaryCard from '../../components/tickets/TicketSummaryCard/TicketSummaryCard.vue'
import TicketInfoCard from '../../components/tickets/TicketInfoCard/TicketInfoCard.vue'
import ProgressTimeline from '../../components/tickets/ProgressTimeline/ProgressTimeline.vue'
import TicketActionsCard from '../../components/tickets/TicketActionsCard/TicketActionsCard.vue'
import { useSidebar } from '../../composables/useSidebar.js'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useNotificationStore } from '../../stores/notificationStore.js'
import { ticketApi, normalizeTicket, normalizeMessage } from '../../services/ticketApi.js'
import { echo } from '../../echo.js'
import { useToast } from '../../composables/useToast.js'

const route = useRoute()
const router = useRouter()
const store = useTicketStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const toast = useToast()
const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const ticket = ref(null)
const isLoading = ref(true)
const messages = ref([])
const messagesContainer = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadMessages = async () => {
  if (!ticket.value) return
  messages.value = await ticketApi.getMessages(ticket.value.id)
  scrollToBottom()
}

onMounted(async () => {
  ticket.value = await store.fetchTicket(Number(route.params.id))
  isLoading.value = false
  await loadMessages()
  notificationStore.setActiveTicket(ticket.value.id)

  // Real-time: agent replies push here instantly (sender excluded via X-Socket-ID)
  echo.channel(`ticket.${ticket.value.id}`)
    .listen('.message.sent', (data) => {
      messages.value.push(normalizeMessage(data.message))
      scrollToBottom()
    })

  // Real-time: ticket status/priority changed by agent
  echo.channel('tickets')
    .listen('.ticket.updated', (data) => {
      if (data.ticket.id === ticket.value.id) {
        ticket.value = normalizeTicket(data.ticket)
        toast.info(`Your ticket status changed to "${data.ticket.status}".`)
      }
    })
})

onUnmounted(() => {
  if (ticket.value) {
    echo.leave(`ticket.${ticket.value.id}`)
  }
  echo.leave('tickets')
  notificationStore.clearActiveTicket()
})

const goBack = () => router.push('/dashboard')

// â”€â”€â”€ Conversation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const message     = ref('')
const searchQuery = ref('')

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const highlightText = (text, query) => {
  const safe = escapeHtml(text)
  if (!query.trim()) return safe
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return safe.replace(new RegExp(pattern, 'gi'), m => `<mark class="conversation__highlight">${m}</mark>`)
}

const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) return messages.value
  const q = searchQuery.value.toLowerCase()
  return messages.value.filter(m => m.text.toLowerCase().includes(q))
})

// Scroll to bottom only when not searching
watch(searchQuery, (q) => { if (!q) scrollToBottom() })

const handleSend = async () => {
  if (!message.value.trim()) return
  const text = message.value.trim()
  message.value = '' // clear immediately so it feels instant
  try {
    const sent = await ticketApi.sendMessage(
      ticket.value.id,
      { sender: authStore.username, isAgent: false, message: text },
      echo.socketId() // tells server: don't echo back to me
    )
    messages.value.push(sent)
    scrollToBottom()
  } catch {
    message.value = text // restore on failure
    toast.error('Message could not be sent. Please try again.')
  }
}

// â”€â”€â”€ Delete Ticket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

const handleDeleteTicket = async () => {
  isDeleting.value = true
  try {
    await store.deleteTicket(ticket.value.id)
    router.push('/dashboard')
  } catch {
    // toast is handled in ticketStore
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div class="ticket-detail-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="ticket-detail-page__content">
      <AppHeader title="Ticket Details" subtitle="View and respond to your ticket" @toggle-sidebar="toggleSidebar" />

      <BaseButton variant="ghost" class="ticket-detail-page__back" @click="goBack">
        <ArrowLeft :size="14" />
        Back to tickets
      </BaseButton>

      <!-- Skeleton while the ticket is loading -->
      <div v-if="isLoading" class="ticket-detail-page__body">
        <div class="ticket-detail-page__main">
          <SkeletonLoader variant="card" :rows="3" />
          <SkeletonLoader variant="card" :rows="6" />
        </div>
        <div class="ticket-detail-page__aside">
          <SkeletonLoader variant="card" :rows="4" />
          <SkeletonLoader variant="card" :rows="3" />
          <SkeletonLoader variant="card" :rows="2" />
        </div>
      </div>

      <div v-else-if="ticket">

        <div class="ticket-detail-page__body">

          <!-- â”€â”€â”€ LEFT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div class="ticket-detail-page__main">

            <TicketSummaryCard :ticket="ticket" />

            <!-- Conversation -->
            <div class="conversation">

              <div class="conversation__header">
                <h3 class="conversation__title">Conversation</h3>

                <BaseSearchInput
                  v-model="searchQuery"
                  size="sm"
                  clearable
                  placeholder="Search messages…"
                  class="conversation__search"
                >
                  <template #suffix>
                    <span v-if="searchQuery" class="conversation__search-count">
                      {{ filteredMessages.length }} result{{ filteredMessages.length !== 1 ? 's' : '' }}
                    </span>
                  </template>
                </BaseSearchInput>
              </div>

              <div ref="messagesContainer" class="conversation__messages">

                <div v-if="filteredMessages.length === 0" class="conversation__empty">
                  {{ searchQuery ? 'No messages match your search.' : 'No messages yet. Type below to start the conversation.' }}
                </div>

                <div
                  v-for="msg in filteredMessages"
                  :key="msg.id"
                  :class="['conversation__message', msg.isAgent ? 'conversation__message--theirs' : 'conversation__message--mine']"
                >
                  <div class="conversation__bubble" v-html="highlightText(msg.text, searchQuery)"></div>
                  <div class="conversation__meta">
                    <span class="conversation__sender-name">{{ msg.isAgent ? 'Support Team' : 'You' }}</span>
                    <span class="conversation__time">{{ msg.time }}</span>
                  </div>
                </div>

              </div>

              <!-- Message Composer -->
              <div class="conversation__composer">
                <textarea
                  v-model="message"
                  class="conversation__textarea"
                  placeholder="Type your message… "
                  rows="3"
                  @keydown.enter.exact.prevent="handleSend"
                ></textarea>

                <div class="conversation__actions">
                  <BaseButton variant="ghost" class="conversation__attach">
                    <Paperclip :size="15" />
                    Attach file
                  </BaseButton>

                  <BaseButton variant="primary" size="sm" :full-width="false" class="conversation__send" @click="handleSend">
                    Send
                    <Send :size="14" />
                  </BaseButton>
                </div>

              </div>

            </div>

          </div>

          <!-- â”€â”€â”€ RIGHT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div class="ticket-detail-page__aside">

            <TicketInfoCard :ticket="ticket" />

            <ProgressTimeline :status="ticket.status" />

            <!-- client can only delete the ticket -->
            <TicketActionsCard @delete="showDeleteConfirm = true" />

          </div>

        </div>

      </div>

    </main>

    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="Delete this ticket?"
      message="This will permanently delete the ticket and its entire conversation history. This cannot be undone."
      :confirm-label="isDeleting ? 'Deleting…' : 'Yes, Delete'"
      cancel-label="Cancel"
      @confirm="handleDeleteTicket"
      @cancel="showDeleteConfirm = false"
    />

  </div>
</template>
