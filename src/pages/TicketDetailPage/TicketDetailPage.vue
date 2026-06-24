<script setup>
import './TicketDetailPage.scss'

import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSidebar } from '../../composables/useSidebar.js'
import {
  ArrowLeft,
  FileText,
  Paperclip,
  Download,
  Send,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Trash2,
  CircleUserRound,
  Check,
} from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import { useTicketStore } from '../../stores/ticketStore.js'

const route = useRoute()
const router = useRouter()
const store = useTicketStore()
const { tickets, conversations } = storeToRefs(store)

const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar(true)

const ticket = computed(() =>
  tickets.value.find(t => t.id === Number(route.params.id))
)

const goBack = () => router.push('/dashboard')

// ─── Conversation ─────────────────────────────────────────────────────────────

const message = ref('')

const ticketConversations = computed(() =>
  conversations.value[ticket.value?.id] || []
)

const handleSend = () => {
  if (!message.value.trim()) return
  store.sendMessage(ticket.value.id, { isAgent: false, text: message.value.trim() })
  message.value = ''
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

const STATUS_OPTIONS = [
  { label: 'Open',        value: 'Open',        variant: 'primary' },
  { label: 'Pending',     value: 'Pending',     variant: 'warning' },
  { label: 'In Progress', value: 'In Progress', variant: 'info'    },
  { label: 'Approved',    value: 'Approved',    variant: 'success' },
  { label: 'Rejected',    value: 'Rejected',    variant: 'danger'  },
]

const handleUpdateStatus = (newStatus) => {
  store.updateTicketStatus(ticket.value.id, newStatus)
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

              <h3 class="conversation__title">Conversation</h3>

              <div class="conversation__messages">

                <div
                  v-for="msg in ticketConversations"
                  :key="msg.id"
                  class="conversation__message"
                >

                  <div class="conversation__message-header">
                    <div class="conversation__sender">
                      <CircleUserRound :size="34" class="conversation__avatar" />
                      <span class="conversation__author">
                        {{ msg.isAgent ? 'Support Team' : 'You' }}
                      </span>
                      <span :class="['conversation__badge', msg.isAgent ? 'conversation__badge--agent' : 'conversation__badge--employee']">
                        {{ msg.role }}
                      </span>
                    </div>
                    <span class="conversation__time">{{ msg.time }}</span>
                  </div>

                  <p class="conversation__text">{{ msg.text }}</p>

                </div>

              </div>

              <!-- Message Composer -->
              <div class="conversation__composer">
                <textarea
                  v-model="message"
                  class="conversation__textarea"
                  placeholder="Type Your Message...."
                  rows="3"
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

              <!-- Update Status -->
              <div class="actions-item">
                <button class="actions-item__header" @click="toggleAction('status')">
                  <div class="actions-item__left">
                    <RefreshCw :size="15" />
                    <span>Update Status</span>
                  </div>
                  <component :is="openAction === 'status' ? ChevronUp : ChevronDown" :size="15" />
                </button>

                <div v-if="openAction === 'status'" class="actions-item__content">
                  <button
                    v-for="opt in STATUS_OPTIONS"
                    :key="opt.value"
                    :class="['status-option', `status-option--${opt.variant}`]"
                    @click="handleUpdateStatus(opt.value)"
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

              <!-- Close Ticket -->
              <div class="actions-item actions-item--danger">
                <button class="actions-item__header" @click="toggleAction('close')">
                  <div class="actions-item__left">
                    <Trash2 :size="15" />
                    <span>Close Ticket</span>
                  </div>
                  <component :is="openAction === 'close' ? ChevronUp : ChevronDown" :size="15" />
                </button>

                <div v-if="openAction === 'close'" class="actions-item__content">
                  <p class="actions-item__confirm-text">Are you sure you want to close this ticket?</p>
                  <button class="actions-item__confirm-btn" @click="handleUpdateStatus('Rejected')">
                    Yes, Close Ticket
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  </div>
</template>
