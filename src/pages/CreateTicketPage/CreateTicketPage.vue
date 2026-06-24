<script setup>
import './CreateTicketPage.scss'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebar } from '../../composables/useSidebar.js'
import { Send, ChevronRight, ListChecks, HelpCircle, CheckCircle2, Paperclip, X } from 'lucide-vue-next'

import AppSidebar from '../../components/layout/AppSidebar/AppSidebar.vue'
import AppHeader from '../../components/layout/AppHeader/AppHeader.vue'
import BaseButton from '../../components/common/BaseButton/BaseButton.vue'
import BaseInput from '../../components/common/BaseInput/BaseInput.vue'
import { useTicketStore } from '../../stores/ticketStore.js'

const router = useRouter()
const store = useTicketStore()
const { isSidebarCollapsed, toggleSidebar, closeSidebar } = useSidebar()

const subject = ref('')
const description = ref('')
const category = ref('')
const priority = ref('low')
const attachment = ref(null)
const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  attachment.value = file
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (!file) return
  attachment.value = file
}

const removeAttachment = () => {
  attachment.value = null
  fileInput.value.value = ''
}

const handleCancel = () => {
  router.push('/dashboard')
}

const handleSubmit = () => {
  if (!subject.value.trim() || !description.value.trim()) return

  store.addTicket({
    subject: subject.value.trim(),
    description: description.value.trim(),
    category: category.value,
    priority: priority.value,
    attachment: attachment.value ? attachment.value.name : null,
  })

  router.push('/dashboard')
}
</script>

<template>
  <div class="create-ticket-page">

    <AppSidebar :is-collapsed="isSidebarCollapsed" @close="closeSidebar" />

    <main class="create-ticket-page__content">

      <AppHeader @toggle-sidebar="toggleSidebar" />

      <div class="create-ticket-page__body">

        <form class="ticket-form" @submit.prevent="handleSubmit">

          <h2 class="ticket-form__title">Ticket Information</h2>

          <p class="ticket-form__subtitle">
            Fill in the details below to raise a new support Ticket.
          </p>

          <div class="form-row">

            <div class="form-group">
              <label class="form-group__label">
                Category <span class="form-group__required">*</span>
              </label>

              <select
                v-model="category"
                class="form-group__select"
              >
                <option value="">IT Support</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="account">Account</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-group__label">
                Priority <span class="form-group__required">*</span>
              </label>

              <div class="priority-buttons">

                <button
                  :class="['priority-button', 'priority-button--low', { 'priority-button--active': priority === 'low' }]"
                  type="button"
                  @click="priority = 'low'"
                >
                  Low
                </button>

                <button
                  :class="['priority-button', 'priority-button--medium', { 'priority-button--active': priority === 'medium' }]"
                  type="button"
                  @click="priority = 'medium'"
                >
                  Medium
                </button>

                <button
                  :class="['priority-button', 'priority-button--high', { 'priority-button--active': priority === 'high' }]"
                  type="button"
                  @click="priority = 'high'"
                >
                  High
                </button>

              </div>
            </div>

          </div>

          <BaseInput
            v-model="subject"
            label="Subject"
            :required="true"
            placeholder="Login Issue"
          />

          <div class="form-group">
            <label class="form-group__label">
              Description <span class="form-group__required">*</span>
            </label>

            <div class="form-group__textarea-wrapper">
              <textarea
                v-model="description"
                class="form-group__textarea"
                rows="8"
                placeholder="Describe your issue in detail..."
                maxlength="200"
              ></textarea>

              <span class="form-group__char-count">
                {{ description.length }}/200
              </span>
            </div>
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
              <p>
                <span class="upload-box__link">Click to upload</span>
                or drag and drop
              </p>
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

          <div class="ticket-form__actions">

            <BaseButton
              variant="secondary"
              @click="handleCancel"
            >
              cancle
            </BaseButton>

            <BaseButton type="submit">
              Submit Ticket
              <Send :size="15" />
            </BaseButton>

          </div>

        </form>

        <div class="ticket-side-panel">

          <div class="side-card">

            <h3 class="side-card__title">
              <ListChecks :size="18" />
              Frequently Reported Issues
            </h3>

            <p class="side-card__subtitle">
              Select a common issue to speed up the process.
            </p>

            <div class="side-card__list">

              <button class="side-card__item">
                <span>Password Reset</span>
                <ChevronRight :size="16" />
              </button>

              <button class="side-card__item">
                <span>VPN Access</span>
                <ChevronRight :size="16" />
              </button>

              <button class="side-card__item">
                <span>Outlook Not Working</span>
                <ChevronRight :size="16" />
              </button>

              <button class="side-card__item">
                <span>Email not suncing</span>
                <ChevronRight :size="16" />
              </button>

              <button class="side-card__item">
                <span>Password Reset</span>
              </button>

            </div>

          </div>

          <div class="side-card">

            <h3 class="side-card__title">
              <HelpCircle :size="18" />
              Guidlines
            </h3>

            <ul class="side-card__guidelines">

              <li>
                <CheckCircle2 :size="15" />
                Fill in the details below to raise a new suppport Ticket.
              </li>

              <li>
                <CheckCircle2 :size="15" />
                Fill in the details below to raise a new suppport Ticket.
              </li>

              <li>
                <CheckCircle2 :size="15" />
                Fill in the details below to raise a new suppport Ticket.
              </li>

            </ul>

          </div>

        </div>

      </div>

    </main>

  </div>
</template>
