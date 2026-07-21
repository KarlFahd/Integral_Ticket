<script setup>
// The "Ticket Information" sidebar card on a ticket detail page — same
// six rows (Status/Priority/Category/Created by/Created on/Ticket ID)
// were duplicated between TicketDetailPage and AgentTicketDetailPage.
import './TicketInfoCard.scss'

defineProps({
  ticket: {
    type: Object,
    required: true,
  },
})
</script>

<template>
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
          {{ ticket.priority }}
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
</template>
