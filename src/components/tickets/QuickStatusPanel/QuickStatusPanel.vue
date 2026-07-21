<script setup>
// The agent dashboard's "Quick Status" side panel — a count per ticket
// status, with Resolved linking through to the History page.

//TICKET -QS admin
import './QuickStatusPanel.scss'
import AgentPanel from '../AgentPanel/AgentPanel.vue'

defineProps({
  openCount: {
    type: Number,
    required: true,
  },
  pendingCount: {
    type: Number,
    required: true,
  },
  inProgressCount: {
    type: Number,
    required: true,
  },
  resolvedCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['view-history'])
</script>

<template>
  <AgentPanel title="Quick Status">
    <div class="agent-panel__status-list">
      <div class="quick-status-item">
        <span class="quick-status-item__dot quick-status-item__dot--primary"></span>
        <span class="quick-status-item__label">Open</span>
        <span class="quick-status-item__count">{{ openCount }}</span>
      </div>
      <div class="quick-status-item">
        <span class="quick-status-item__dot quick-status-item__dot--warning"></span>
        <span class="quick-status-item__label">Pending</span>
        <span class="quick-status-item__count">{{ pendingCount }}</span>
      </div>
      <div class="quick-status-item">
        <span class="quick-status-item__dot quick-status-item__dot--info"></span>
        <span class="quick-status-item__label">In Progress</span>
        <span class="quick-status-item__count">{{ inProgressCount }}</span>
      </div>
      <div class="quick-status-item quick-status-item--clickable" @click="emit('view-history')">
        <span class="quick-status-item__dot quick-status-item__dot--success"></span>
        <span class="quick-status-item__label">Resolved</span>
        <span class="quick-status-item__count">{{ resolvedCount }}</span>
      </div>
    </div>
  </AgentPanel>
</template>
