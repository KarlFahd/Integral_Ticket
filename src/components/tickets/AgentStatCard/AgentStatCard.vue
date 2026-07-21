<script setup>
// The agent dashboard's own stat-card look (tinted icon circle + shadow) is
// deliberately different from the employee-facing TicketStatCard (flat,
// gray icon box) — see ClientDashboardPage vs AgentDashboardPage. Rather
// than bend one component to do both looks, this is its sibling: same
// idea, agent's visual language, plus the "Resolved → click through to
// History" behavior neither ClientDashboard's stat cards need.

//TICKETS -Admin parts
import './AgentStatCard.scss'

defineProps({
  label: {
    type: String,
    required: true,
  },

  value: {
    type: [String, Number],
    required: true,
  },

  variant: {
    type: String,
    default: 'primary', // 'primary' | 'warning' | 'info' | 'success'
  },

  icon: {
    type: [Object, Function],
    default: null,
  },

  subtitle: {
    type: String,
    default: 'Need Your Attention',
  },

  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="['stat-card', { 'stat-card--clickable': clickable }]"
    @click="clickable && emit('click')"
  >
    <div :class="['stat-card__icon', `stat-card__icon--${variant}`]">
      <component :is="icon" v-if="icon" :size="22" />
    </div>
    <div class="stat-card__info">
      <span class="stat-card__label">{{ label }}</span>
      <span :class="['stat-card__value', `stat-card__value--${variant}`]">{{ value }}</span>
      <span class="stat-card__sub">{{ subtitle }}</span>
    </div>
  </div>
</template>
