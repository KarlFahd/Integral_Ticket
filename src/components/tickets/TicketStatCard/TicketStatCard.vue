<script setup>
import './TicketStatCard.scss'

defineProps({
  title: {
    type: String,
    required: true,
  },

  count: {
    type: String,
    required: true,
  },

  variant: {
    type: String,
    default: 'primary',
  },

  icon: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div class="ticket-stat-card">

    <div :class="['ticket-stat-card__icon', `ticket-stat-card__icon--${variant}`]">
      <component
        v-if="icon"
        :is="icon"
        :size="22"
      />
    </div>

    <div class="ticket-stat-card__content">

      <h4 class="ticket-stat-card__title">
        {{ title }}
      </h4>

      <h2 :class="['ticket-stat-card__count', `ticket-stat-card__count--${variant}`]">
        {{ count }}
      </h2>

      <p class="ticket-stat-card__subtitle">
        Need Your Attention
      </p>

    </div>

  </div>
</template>
