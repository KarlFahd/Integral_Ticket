<script setup>
import './TicketDetailPage.scss'

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidebar } from '../../composables/useSidebar.js'
import {
  ArrowLeft,
  FileText,
  Paperclip,
  Download,
  Send,
  ChevronDown,
  ChevronUp,
  Flag,
  Clock,
  CircleUserRound,
  Check,
  Search,
} from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { ticketApi } from '../../services/ticketApi.js'

const route = useRoute()
const router = useRouter()
const store = useTicketStore()
const authStore = useAuthStore()

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar(true)

const ticket = ref(null)
const messages = ref([])
const messagesContainer = ref(null)
let pollInterval = null

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
  await loadMessages()
  pollInterval = setInterval(loadMessages, 4000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
})

const goBack = () => router.push('/dashboard')

// ─── Conversation ─────────────────────────────────────────────────────────────

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
  const sent = await ticketApi.sendMessage(ticket.value.id, {
    sender:  authStore.username,
    isAgent: false,
    message: message.value.trim(),
  })
  messages.value.push(sent)
  message.value = ''
  scrollToBottom()
}

// ─── Progress Timeline ────────────────────────────────────────────────────────

const TIMELINE_STEPS = ['Submitted', 'Under Review', 'In Progress', 'Resolved']

const STATUS_TO_STEP = {
  'Open':        0,
  'Pending':     1,
  'In Progress': 2,
  'Approved':    3,
  'Resolved':    3,
  'Rejected':    2,
}

const currentStep = computed(() => STATUS_TO_STEP[ticket.value?.status] ?? 0)

const stepStatus = (index) => {
  if (index < currentStep.value) return 'done'
  if (index === currentStep.value) return 'active'
  return 'pending'
}

// ─── Actions Accordion ────────────────────────────────────────────────────────

const openAction = ref(null)

const toggleAction = (key) => {
  openAction.value = openAction.value === key ? null : key
}

const PRIORITY_OPTIONS = [
  { label: 'Low',    value: 'low',    variant: 'success' },
  { label: 'Medium', value: 'medium', variant: 'warning' },
  { label: 'High',   value: 'high',   variant: 'danger'  },
]

const handleUpdatePriority = async (newPriority) => {
  const updated = await store.updateTicketPriority(ticket.value.id, newPriority)
  if (updated) ticket.value = updated
  openAction.value = null
}
</script>

<template>
  <div class="ticket-detail-page">

    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" />

    <main class="ticket-detail-page__content">

      <AppHeader @toggle-sidebar="toggleSidebar" />

      <div v-if="ticket">

        <button class="ticket-detail-page__back" @click="goBack">
          <ArrowLeft :size="14" />
          Back To Ticket
        </button>

        <div class="ticket-detail-page__body">

          <!-- ─── LEFT COLUMN ─────────────────────────────────────── -->
          <div class="ticket-detail-page__main">

            <!-- Ticket Summary Card -->
            <div class="ticket-summary">

              <div class="ticket-summary__icon-box">
                <FileText :size="24" />
              </div>

              <div class="ticket-summary__info">

                <h3 class="ticket-summary__title">{{ ticket.title }}</h3>

                <p class="ticket-summary__description">{{ ticket.description }}</p>

                <div class="ticket-summary__meta">

                  <div class="ticket-summary__tags">
                    <span :class="['ticket-summary__tag', `ticket-summary__tag--${ticket.statusVariant}`]">
                      {{ ticket.status }}
                    </span>

                    <span :class="['ticket-summary__tag', `ticket-summary__tag--${ticket.priorityVariant}`]">
                      ● {{ ticket.priority }}
                    </span>

                    <span class="ticket-summary__tag ticket-summary__tag--default">
                      {{ ticket.category }}
                    </span>
                  </div>

                  <div class="ticket-summary__attachment">
                    <Paperclip :size="13" />
                    <template v-if="ticket.attachment">
                      <span class="ticket-summary__attachment-name">{{ ticket.attachment }}</span>
                      <Download :size="13" class="ticket-summary__attachment-download" />
                    </template>
                    <span v-else class="ticket-summary__attachment-empty">No attachment</span>
                  </div>

                </div>

              </div>

              <div class="ticket-summary__date">
                <span>Created On:</span>
                <div class="ticket-summary__date-value">
                  <span>{{ ticket.date }}</span>
                </div>
              </div>

            </div>

            <!-- Conversation -->
            <div class="conversation">

              <div class="conversation__header">
                <h3 class="conversation__title">Conversation</h3>

                <div class="conversation__search">
                  <Search :size="13" class="conversation__search-icon" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="conversation__search-input"
                    placeholder="Search messages…"
                  />
                  <span v-if="searchQuery" class="conversation__search-count">
                    {{ filteredMessages.length }} result{{ filteredMessages.length !== 1 ? 's' : '' }}
                  </span>
                  <button v-if="searchQuery" class="conversation__search-clear" @click="searchQuery = ''">✕</button>
                </div>
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
                  <button class="conversation__attach">
                    <Paperclip :size="15" />
                    Attach file
                  </button>

                  <button class="conversation__send" @click="handleSend">
                    Send
                    <Send :size="14" />
                  </button>
                </div>

              </div>

            </div>

          </div>

          <!-- ─── RIGHT COLUMN ───────────────────────────────────── -->
          <div class="ticket-detail-page__aside">

            <!-- Ticket Information -->
            <div class="info-card">

              <h3 class="info-card__title">Ticket Information</h3>

              <div class="info-card__rows">

                <div class="info-card__row">
                  <span class="info-card__label">Status</span>
                  <span :class="['info-card__badge', `info-card__badge--${ticket.statusVariant}`]">
                    {{ ticket.status }}
                  </span>
                </div>

                <div class="info-card__row">
                  <span class="info-card__label">Priority</span>
                  <span :class="['info-card__badge info-card__badge--outlined', `info-card__badge--${ticket.priorityVariant}`]">
                    ● {{ ticket.priority }}
                  </span>
                </div>

                <div class="info-card__row">
                  <span class="info-card__label">Category</span>
                  <span class="info-card__value">{{ ticket.category }}</span>
                </div>

                <div class="info-card__row">
                  <span class="info-card__label">Created by</span>
                  <span class="info-card__value">{{ ticket.createdBy }}</span>
                </div>

                <div class="info-card__row">
                  <span class="info-card__label">Created on</span>
                  <span class="info-card__value">{{ ticket.date }}</span>
                </div>

                <div class="info-card__row">
                  <span class="info-card__label">Ticket ID</span>
                  <span class="info-card__value">{{ ticket.ticketId }}</span>
                </div>

              </div>

            </div>

            <!-- Progress Timeline -->
            <div class="timeline-card">

              <h3 class="timeline-card__title">Progress Timeline</h3>

              <div class="timeline-card__steps">

                <div
                  v-for="(step, index) in TIMELINE_STEPS"
                  :key="step"
                  class="timeline-step"
                >
                  <div class="timeline-step__track">
                    <div :class="['timeline-step__dot', `timeline-step__dot--${stepStatus(index)}`]">
                      <Check v-if="stepStatus(index) === 'done'" :size="11" />
                    </div>
                    <div
                      v-if="index < TIMELINE_STEPS.length - 1"
                      :class="['timeline-step__line', stepStatus(index) === 'done' ? 'timeline-step__line--done' : '']"
                    ></div>
                  </div>

                  <span :class="['timeline-step__label', `timeline-step__label--${stepStatus(index)}`]">
                    {{ step }}
                  </span>
                </div>

              </div>

            </div>

            <!-- Actions -->
            <div class="actions-card">

              <h3 class="actions-card__title">Actions</h3>

              <!-- Change Priority -->
              <div class="actions-item">
                <button class="actions-item__header" @click="toggleAction('priority')">
                  <div class="actions-item__left">
                    <Flag :size="15" />
                    <span>Change Priority</span>
                  </div>
                  <component :is="openAction === 'priority' ? ChevronUp : ChevronDown" :size="15" />
                </button>

                <div v-if="openAction === 'priority'" class="actions-item__content">
                  <button
                    v-for="opt in PRIORITY_OPTIONS"
                    :key="opt.value"
                    :class="['status-option', `status-option--${opt.variant}`]"
                    @click="handleUpdatePriority(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <!-- Add Note -->
              <div class="actions-item">
                <button class="actions-item__header" @click="toggleAction('note')">
                  <div class="actions-item__left">
                    <Clock :size="15" />
                    <span>Add note</span>
                  </div>
                  <component :is="openAction === 'note' ? ChevronUp : ChevronDown" :size="15" />
                </button>

                <div v-if="openAction === 'note'" class="actions-item__content">
                  <textarea class="actions-item__textarea" placeholder="Write a note..."></textarea>
                  <button class="actions-item__save">Save Note</button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  </div>
</template>
