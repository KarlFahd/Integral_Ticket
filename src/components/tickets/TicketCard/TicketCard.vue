<script setup>
import './TicketCard.scss'

import { CalendarDays } from 'lucide-vue-next'

defineProps({
  id: {
    type: Number,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },

  statusVariant: {
    type: String,
    default: 'success',
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="ticket-card" @click="emit('select', id)">

    <div class="ticket-card__header">

      <h3>{{ title }}</h3>

      <div :class="['ticket-card__status', `ticket-card__status--${statusVariant}`]">
        ● {{ status }}
      </div>

    </div>

    <p class="ticket-card__description">
      {{ description }}
    </p>

    <div class="ticket-card__footer">
      <CalendarDays :size="15" />
      <span>{{ date }}</span>
    </div>

  </div>
</template>
