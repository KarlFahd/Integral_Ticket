<script setup>
import './BaseChip.scss'

defineProps({
  type: {
    type: String,
    default: 'button',
  },

  // Semantic color, matching the app's existing status/priority palette.
  color: {
    type: String,
    default: 'primary', // 'primary' | 'success' | 'warning' | 'info' | 'danger'
  },

  // True once this chip is the selected option in its group.
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => emit('click')
</script>

<template>
  <button
    :type="type"
    :class="[
      'base-chip',
      `base-chip--${color}`,
      { 'base-chip--active': active },
    ]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
