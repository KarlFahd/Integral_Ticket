<script setup>
import './CreateTicketPage.scss'

import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Send, ChevronRight, ListChecks, HelpCircle, CheckCircle2, Paperclip, X, ArrowLeft } from 'lucide-vue-next'

import AppLayout from '../../components/layout/AppLayout/AppLayout.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseInput from '../../components/common/BaseInput/BaseInput.vue'
import BaseChip from '../../components/common/BaseChip/BaseChip.vue'
import BaseIconButton from '../../components/common/BaseIconButton/BaseIconButton.vue'
import BaseListButton from '../../components/common/BaseListButton/BaseListButton.vue'
import BaseSelect from '../../components/common/BaseSelect/BaseSelect.vue'
import { useTicketStore } from '../../stores/ticketStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { CATEGORIES, PRIORITIES } from '../../constants/lookups.js'

const router    = useRouter()
const store     = useTicketStore()
const authStore = useAuthStore()
const { isLoading, error } = storeToRefs(store)
const subject      = ref('')
const description  = ref('')
const categoryId   = ref(null)
const priorityId   = ref(PRIORITIES.find(p => p.name === 'Low').id)
const attachment   = ref(null)
const fileInput    = ref(null)

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

watch(subject, () => { validationErrors.value.subject = '' })
watch(description, () => { validationErrors.value.description = '' })

// ─── Frequently Reported Issues ───────────────────────────────────────────────

const categoryIdFor = (name) => CATEGORIES.find(c => c.name === name).id
const priorityIdFor = (name) => PRIORITIES.find(p => p.name === name).id

const QUICK_ISSUES = [
  { label: 'Password Reset',      subject: 'Password Reset Request',   category: 'Account',  priority: 'Medium' },
  { label: 'VPN Access',          subject: 'VPN Access Issue',          category: 'Network',  priority: 'High'   },
  { label: 'Outlook Not Working', subject: 'Outlook Not Working',       category: 'Software', priority: 'Medium' },
  { label: 'Email Not Syncing',   subject: 'Email Not Syncing',         category: 'Software', priority: 'Low'    },
  { label: 'Screen / Monitor',    subject: 'Monitor / Screen Issue',    category: 'Hardware', priority: 'High'   },
]

const applyQuickIssue = (issue) => {
  subject.value    = issue.subject
  categoryId.value = categoryIdFor(issue.category)
  priorityId.value = priorityIdFor(issue.priority)
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
      categoryId:  categoryId.value || categoryIdFor('Software'),
      priorityId:  priorityId.value,
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
  <AppLayout
    class="create-ticket-page"
    content-class="create-ticket-page__content"
    title="Add Ticket"
    subtitle="Submit a new support request"
  >
      <!-- Sticky action bar — always visible at the top -->
      <div class="create-ticket-page__action-bar">
        <BaseButton variant="ghost" @click="handleCancel">
          <ArrowLeft :size="14" />
          Back To Dashboard
        </BaseButton>

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
              <BaseSelect v-model="categoryId" size="md" class="form-group__select">
                <option :value="null">IT Support</option>
                <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </BaseSelect>
            </div>

            <div class="form-group">
              <label class="form-group__label">
                Priority <span class="form-group__required">*</span>
              </label>
              <div class="priority-buttons">
                <BaseChip
                  v-for="pri in PRIORITIES"
                  :key="pri.id"
                  :color="pri.name === 'Low' ? 'success' : pri.name === 'Medium' ? 'warning' : 'danger'"
                  :active="priorityId === pri.id"
                  @click="priorityId = pri.id"
                >{{ pri.name }}</BaseChip>
              </div>
            </div>

          </div>

          <div class="form-group">
            <BaseInput
              v-model="subject"
              label="Subject"
              :required="true"
              :error="!!validationErrors.subject"
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
              <BaseIconButton variant="ghost-danger" size="sm" class="upload-box__remove" @click="removeAttachment">
                <X :size="14" />
              </BaseIconButton>
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
              <BaseListButton
                v-for="issue in QUICK_ISSUES"
                :key="issue.label"
                class="side-card__item"
                @click="applyQuickIssue(issue)"
              >
                <span>{{ issue.label }}</span>
                <ChevronRight :size="16" />
              </BaseListButton>
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

  </AppLayout>
</template>
