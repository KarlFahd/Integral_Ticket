<script setup>
import '../TicketDetailPage/TicketDetailPage.scss'
import './AgentTicketDetailPage.scss'

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Paperclip,
  Send,
} from 'lucide-vue-next'

import AppLayout from '../../components/layout/AppLayout/AppLayout.vue'
import ResolveCelebration from '../../components/common/ResolveCelebration/ResolveCelebration.vue'
import SkeletonLoader from '../../components/common/SkeletonLoader/SkeletonLoader.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseSearchInput from '../../components/common/BaseSearchInput/BaseSearchInput.vue'
import TicketSummaryCard from '../../components/tickets/TicketSummaryCard/TicketSummaryCard.vue'
import TicketInfoCard from '../../components/tickets/TicketInfoCard/TicketInfoCard.vue'
import ProgressTimeline from '../../components/tickets/ProgressTimeline/ProgressTimeline.vue'
import TicketActionsCard from '../../components/tickets/TicketActionsCard/TicketActionsCard.vue'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useNotificationStore } from '../../stores/notificationStore.js'
import { ticketApi, normalizeMessage } from '../../services/ticketApi.js'
import { echo } from '../../echo.js'
import { useToast } from '../../composables/useToast.js'

const route = useRoute()
const router = useRouter()
const store = useTicketStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const toast = useToast()

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

  // Real-time: employee replies push here instantly (sender excluded via X-Socket-ID)
  echo.channel(`ticket.${ticket.value.id}`)
    .listen('.message.sent', (data) => {
      const normalized = normalizeMessage(data.message)
      messages.value.push(normalized)
      scrollToBottom()
      toast.info(`New message from ${normalized.sender}.`)
    })
})

onUnmounted(() => {
  if (ticket.value) {
    echo.leave(`ticket.${ticket.value.id}`)
  }
  notificationStore.clearActiveTicket()
})

const clientName = computed(() => ticket.value?.createdBy || 'Employee')

const goBack = () => router.push('/agent-dashboard')

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

watch(searchQuery, (q) => { if (!q) scrollToBottom() })

const handleSend = async () => {
  if (!message.value.trim()) return
  const text = message.value.trim()
  message.value = ''
  try {
    const sent = await ticketApi.sendMessage(
      ticket.value.id,
      { sender: authStore.username, isAgent: true, message: text },
      echo.socketId()
    )
    messages.value.push(sent)
    scrollToBottom()
  } catch {
    message.value = text
    toast.error('Message could not be sent. Please try again.')
  }
}

// â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const celebration = ref(null)

const handleUpdateStatus = async (newStatusId) => {
  const updated = await store.updateTicketStatus(ticket.value.id, newStatusId)
  if (updated) ticket.value = updated
  // toast is handled in ticketStore
  if (updated?.status === 'Resolved') celebration.value?.fire()
}

// â”€â”€â”€ Delete Ticket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

const handleDeleteTicket = async () => {
  isDeleting.value = true
  try {
    await store.deleteTicket(ticket.value.id)
    router.push('/agent-dashboard')
  } catch {
    // toast is handled in ticketStore
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <AppLayout
    class="agent-ticket-page"
    content-class="agent-ticket-page__content"
    title="Ticket Details"
    subtitle="Review and respond to this ticket"
  >
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
          <SkeletonLoader variant="card" :rows="3" />
        </div>
      </div>

      <div v-else-if="ticket">

        <div class="ticket-detail-page__body">

          <!-- â”€â”€â”€ LEFT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
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
                  :class="['conversation__message', msg.isAgent ? 'conversation__message--mine' : 'conversation__message--theirs']"
                >
                  <div class="conversation__bubble" v-html="highlightText(msg.text, searchQuery)"></div>
                  <div class="conversation__meta">
                    <span class="conversation__sender-name">{{ msg.isAgent ? 'You' : clientName }}</span>
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

          <!-- â”€â”€â”€ RIGHT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div class="ticket-detail-page__aside">

            <TicketInfoCard :ticket="ticket" />

            <ProgressTimeline :status="ticket.status" />

            <TicketActionsCard
              is-agent
              @update-status="handleUpdateStatus"
              @delete="showDeleteConfirm = true"
            />

          </div>

        </div>

      </div>

    <ResolveCelebration ref="celebration" />

    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="Delete this ticket?"
      message="This will permanently delete the ticket and its entire conversation history. This cannot be undone."
      :confirm-label="isDeleting ? 'Deleting…' : 'Yes, Delete'"
      cancel-label="Cancel"
      @confirm="handleDeleteTicket"
      @cancel="showDeleteConfirm = false"
    />

  </AppLayout>
</template>
