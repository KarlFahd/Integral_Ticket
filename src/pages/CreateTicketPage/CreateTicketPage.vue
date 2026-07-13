<script setup>
import './CreateTicketPage.scss'

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSidebar } from '../../composables/useSidebar.js'
import { Send, ChevronRight, ListChecks, HelpCircle, CheckCircle2, Paperclip, X, ArrowLeft } from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseInput from '../../components/common/BaseInput/BaseInput.vue'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore } from '../../stores/authStore.js'

const router    = useRouter()
const store     = useTicketStore()
const authStore = useAuthStore()
const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()
const { isLoading, error } = storeToRefs(store)
const subject     = ref('')
const description = ref('')
const category    = ref('')
const priority    = ref('Low')
const attachment  = ref(null)
const fileInput   = ref(null)

// ─── Frontend validation ──────────────────────────────────────────────────────

const validationErrors = ref({})

const validate = () => {
  const errors = {}
  if (!subject.value.trim())
    errors.subject = 'Subject is required.'
  if (!description.value.trim())
    errors.description = 'Description is required.'
  else if (description.value.trim().length < 10)
    errors.description = 'Description must be at least 10 characters.'
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

// ─── Frequently Reported Issues ───────────────────────────────────────────────

const QUICK_ISSUES = [
  { label: 'Password Reset',      subject: 'Password Reset Request',   category: 'Account',  priority: 'Medium' },
  { label: 'VPN Access',          subject: 'VPN Access Issue',          category: 'Network',  priority: 'High'   },
  { label: 'Outlook Not Working', subject: 'Outlook Not Working',       category: 'Software', priority: 'Medium' },
  { label: 'Email Not Syncing',   subject: 'Email Not Syncing',         category: 'Software', priority: 'Low'    },
  { label: 'Screen / Monitor',    subject: 'Monitor / Screen Issue',    category: 'Hardware', priority: 'High'   },
]

const applyQuickIssue = (issue) => {
  subject.value  = issue.subject
  category.value = issue.category
  priority.value = issue.priority
  validationErrors.value = {}
}

// ─── File handling ────────────────────────────────────────────────────────────

const triggerFileInput = () => fileInput.value.click()

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) attachment.value = file
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) attachment.value = file
}

const removeAttachment = () => {
  attachment.value = null
  fileInput.value.value = ''
}

// ─── Submit ───────────────────────────────────────────────────────────────────

const handleCancel = () => router.push('/dashboard')

const handleSubmit = async () => {
  if (!validate()) return
  store.error = null
  try {
    await store.addTicket({
      subject:     subject.value.trim(),
      description: description.value.trim(),
      category:    category.value || 'Software',
      priority:    priority.value,
      attachment:  attachment.value ? attachment.value.name : null,
      createdBy:   authStore.username,
    })
    router.push('/dashboard')
  } catch {
    // error shown via store.error
  }
}
</script>

<template>
  <div class="create-ticket-page">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" @toggle="toggleSidebar" />

    <main class="create-ticket-page__content">
      <AppHeader title="Add Ticket" subtitle="Submit a new support request" @toggle-sidebar="toggleSidebar" />

      <!-- Sticky action bar — always visible at the top -->
      <div class="create-ticket-page__action-bar">
        <button class="create-ticket-page__back" @click="handleCancel">
          <ArrowLeft :size="14" />
          Back To Dashboard
        </button>

        <div class="create-ticket-page__action-bar-btns">
          <BaseButton variant="secondary" @click="handleCancel">
            Cancel
          </BaseButton>
          <BaseButton type="button" :disabled="isLoading" @click="handleSubmit">
            {{ isLoading ? 'Submitting...' : 'Submit Ticket' }}
            <Send v-if="!isLoading" :size="15" />
          </BaseButton>
        </div>
      </div>

      <div class="create-ticket-page__body">

        <form class="ticket-form" @submit.prevent="handleSubmit">

          <h2 class="ticket-form__title">Ticket Information</h2>

          <p class="ticket-form__subtitle">
            Fill in the details below to raise a new support ticket.
          </p>

          <div class="form-row">

            <div class="form-group">
              <label class="form-group__label">
                Category <span class="form-group__required">*</span>
              </label>
              <select v-model="category" class="form-group__select">
                <option value="">IT Support</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Account">Account</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-group__label">
                Priority <span class="form-group__required">*</span>
              </label>
              <div class="priority-buttons">
                <button
                  :class="['priority-button', 'priority-button--low', { 'priority-button--active': priority === 'Low' }]"
                  type="button"
                  @click="priority = 'Low'"
                >Low</button>
                <button
                  :class="['priority-button', 'priority-button--medium', { 'priority-button--active': priority === 'Medium' }]"
                  type="button"
                  @click="priority = 'Medium'"
                >Medium</button>
                <button
                  :class="['priority-button', 'priority-button--high', { 'priority-button--active': priority === 'High' }]"
                  type="button"
                  @click="priority = 'High'"
                >High</button>
              </div>
            </div>

          </div>

          <div class="form-group">
            <BaseInput
              v-model="subject"
              label="Subject"
              :required="true"
              placeholder="e.g. Login Issue"
            />
            <p v-if="validationErrors.subject" class="form-group__error">
              {{ validationErrors.subject }}
            </p>
          </div>

          <div class="form-group">
            <label class="form-group__label">
              Description <span class="form-group__required">*</span>
            </label>
            <div class="form-group__textarea-wrapper">
              <textarea
                v-model="description"
                class="form-group__textarea"
                :class="{ 'form-group__textarea--error': validationErrors.description }"
                rows="8"
                placeholder="Describe your issue in detail..."
                maxlength="200"
              ></textarea>
              <span class="form-group__char-count">{{ description.length }}/200</span>
            </div>
            <p v-if="validationErrors.description" class="form-group__error">
              {{ validationErrors.description }}
            </p>
          </div>

          <div class="form-group">
            <label class="form-group__label">
              Attachment <span class="form-group__optional">(optional)</span>
            </label>

            <input
              ref="fileInput"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              class="upload-box__input"
              @change="handleFileChange"
            />

            <div
              v-if="!attachment"
              class="upload-box"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <p><span class="upload-box__link">Click to upload</span> or drag and drop</p>
              <span>PNG, JPG, PDF up to 10MB</span>
            </div>

            <div v-else class="upload-box upload-box--selected">
              <Paperclip :size="18" />
              <span class="upload-box__filename">{{ attachment.name }}</span>
              <button type="button" class="upload-box__remove" @click="removeAttachment">
                <X :size="14" />
              </button>
            </div>
          </div>

          <p v-if="error" class="ticket-form__error">{{ error }}</p>

        </form>

        <div class="ticket-side-panel">

          <div class="side-card">
            <h3 class="side-card__title">
              <ListChecks :size="18" />
              Frequently Reported Issues
            </h3>
            <p class="side-card__subtitle">
              Select a common issue to pre-fill the form.
            </p>
            <div class="side-card__list">
              <button
                v-for="issue in QUICK_ISSUES"
                :key="issue.label"
                class="side-card__item"
                type="button"
                @click="applyQuickIssue(issue)"
              >
                <span>{{ issue.label }}</span>
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>

          <div class="side-card">
            <h3 class="side-card__title">
              <HelpCircle :size="18" />
              Guidelines
            </h3>
            <ul class="side-card__guidelines">
              <li>
                <CheckCircle2 :size="15" />
                Be specific — describe the issue as clearly as possible.
              </li>
              <li>
                <CheckCircle2 :size="15" />
                Attach a screenshot if it helps explain the issue.
              </li>
              <li>
                <CheckCircle2 :size="15" />
                Select the correct category so your ticket reaches the right team.
              </li>
            </ul>
          </div>

        </div>

      </div>

    </main>

  </div>
</template>
