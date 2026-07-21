<script setup>
// The hero card at the top of a ticket detail page (title, description,
// status/priority/category tags, attachment, created date). Identical
// markup was copy-pasted between TicketDetailPage and AgentTicketDetailPage
// — this is the single source of truth for both now.
import './TicketSummaryCard.scss'
import { FileText, Paperclip, Download } from 'lucide-vue-next'

defineProps({
  ticket: {
    type: Object,
    required: true,
  },
})
</script>

<template>
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
            {{ ticket.priority }}
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
</template>
