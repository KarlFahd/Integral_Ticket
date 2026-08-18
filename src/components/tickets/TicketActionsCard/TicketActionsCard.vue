<script setup>
// The "Actions" sidebar card on a ticket detail page. The employee view
// only ever showed "Delete Ticket"; the agent view additionally shows
// "Update Status" and "Add note" accordions — this one component now
// covers both, switched by the `is-agent` prop, instead of two near-
// identical hand-written cards.
//
// Note: "Add note" is carried over exactly as it existed before — the
// textarea has no v-model and "Save Note" has no handler in either
// original page, so it's a visual-only stub here too, not a regression.
import { ref } from 'vue'
import './TicketActionsCard.scss'
import { RefreshCw, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import BaseListButton from '../../common/BaseListButton/BaseListButton.vue'
import BaseButton from '../../common/BaseButton/BaseButton.vue'
import BaseChip from '../../common/BaseChip/BaseChip.vue'
import { STATUSES } from '../../../constants/lookups.js'

defineProps({
  isAgent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-status', 'delete'])

const openAction = ref(null)

const toggleAction = (key) => {
  openAction.value = openAction.value === key ? null : key
}

const STATUS_VARIANTS = {
  'Open':        'primary',
  'Pending':     'warning',
  'In Progress': 'info',
  'Resolved':    'success',
  'Rejected':    'danger',
}

const STATUS_OPTIONS = STATUSES.map(s => ({
  label: s.name,
  value: s.id,
  variant: STATUS_VARIANTS[s.name] ?? 'primary',
}))

const selectStatus = (value) => {
  emit('update-status', value)
  openAction.value = null
}
</script>

<template>
  <div class="actions-card">

    <h3 class="actions-card__title">Actions</h3>

    <template v-if="isAgent">

      <!-- Update Status -->
      <div class="actions-item">
        <BaseListButton class="actions-item__header" @click="toggleAction('status')">
          <div class="actions-item__left">
            <RefreshCw :size="15" />
            <span>Update Status</span>
          </div>
          <component :is="openAction === 'status' ? ChevronUp : ChevronDown" :size="15" />
        </BaseListButton>

        <div v-if="openAction === 'status'" class="actions-item__content">
          <BaseChip
            v-for="opt in STATUS_OPTIONS"
            :key="opt.value"
            :color="opt.variant"
            class="status-option"
            @click="selectStatus(opt.value)"
          >
            {{ opt.label }}
          </BaseChip>
        </div>
      </div>

      <!-- Add Note -->
      <div class="actions-item">
        <BaseListButton class="actions-item__header" @click="toggleAction('note')">
          <div class="actions-item__left">
            <Clock :size="15" />
            <span>Add note</span>
          </div>
          <component :is="openAction === 'note' ? ChevronUp : ChevronDown" :size="15" />
        </BaseListButton>

        <div v-if="openAction === 'note'" class="actions-item__content">
          <textarea class="actions-item__textarea" placeholder="Write a note..."></textarea>
          <BaseButton variant="primary" size="sm" :full-width="false" class="actions-item__save">Save Note</BaseButton>
        </div>
      </div>

    </template>

    <!-- Delete Ticket -->
    <div class="actions-item actions-item--danger">
      <BaseListButton class="actions-item__header" @click="emit('delete')">
        <div class="actions-item__left">
          <Trash2 :size="15" />
          <span>Delete Ticket</span>
        </div>
      </BaseListButton>
    </div>

  </div>
</template>
