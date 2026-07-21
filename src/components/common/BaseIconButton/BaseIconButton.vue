<script setup>
import './BaseIconButton.scss'

defineProps({
  type: {
    type: String,
    default: 'button',
  },

  // 'ghost'        transparent, muted icon, turns brand-colored on hover (default)
  // 'ghost-danger' transparent, muted icon, turns red on hover — delete/remove actions
  // 'outline'      bordered, inverts to solid brand fill on hover — e.g. calendar nav arrows
  // 'solid'        filled brand background, white icon — e.g. chat send button
  // 'inverse'      white icon for use on dark/colored surfaces (a colored header bar)
  variant: {
    type: String,
    default: 'ghost',
  },

  // 'sm' | 'md' (default) | 'lg' — controls padding around the icon, so the
  // button stays a consistent square/circle regardless of the icon's own size.
  size: {
    type: String,
    default: 'md',
  },

  // Optional tooltip text shown on hover (desktop) — mirrors the app's
  // existing CSS-only `data-tooltip` pattern, no JS tooltip library involved.
  tooltip: {
    type: String,
    default: '',
  },

  disabled: {
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
    :disabled="disabled"
    :data-tooltip="tooltip || undefined"
    :class="[
      'base-icon-button',
      `base-icon-button--${variant}`,
      `base-icon-button--${size}`,
      { 'base-icon-button--tooltip': tooltip },
    ]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
