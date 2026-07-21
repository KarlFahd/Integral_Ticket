<script setup>
// A bare, unstyled clickable row — for menu/list rows whose look is fully
// page-specific (notifications, accordion headers, quick-issue lists).
// It only resets the native <button> defaults that would otherwise fight
// the caller's own class (full width, left-aligned text, no border/bg);
// every visual detail (padding, hover, layout) comes from that class.
import './BaseListButton.scss'

defineProps({
  type: {
    type: String,
    default: 'button',
  },
})

const emit = defineEmits(['click'])

const handleClick = () => emit('click')
</script>

<template>
  <button :type="type" class="base-list-button" @click="handleClick">
    <slot />
  </button>
</template>
