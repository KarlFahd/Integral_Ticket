<script setup>
// The plain white "card with a title" shell shared by the agent dashboard's
// two right-hand panels (Quick Status, Top Category) — was the exact same
// markup/class copy-pasted twice with only the content inside differing.

//TICKETS- admin panel right
import './AgentPanel.scss'

defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="agent-panel">
    <h3 class="agent-panel__title">{{ title }}</h3>
    <slot />
  </div>
</template>
