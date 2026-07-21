<script setup>
import { computed } from 'vue'
import './BaseButton.scss'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },

  type: {
    type: String,
    default: 'button',
  },

  // 'primary'        solid brand fill — main call-to-action
  // 'secondary'      neutral outline — Cancel / alternative action
  // 'outline-danger' neutral outline that turns red on hover — soft/reversible actions (Clear filters)
  // 'danger'         solid red fill — serious, confirmed destructive actions (Disable 2FA)
  // 'ghost'          no background/border, muted text that turns brand-colored on hover — icon+text actions (Back, Attach file)
  // 'link'           no background/border, always brand-colored text, underlines on hover — inline text links (View all, Back to login)
  variant: {
    type: String,
    default: 'primary',
  },

  // 'sm' (36px — compact inline contexts) | 'md' (44px, default — forms) |
  // 'lg' (48px — inline with search bars / filter rows)
  // Ignored by the 'ghost' and 'link' variants, which are always auto-sized to their text.
  size: {
    type: String,
    default: 'md',
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  // Most buttons in the app (form submits) stretch to fill their container.
  // Inline actions (filter bar, empty-state CTA) set this to false.
  fullWidth: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['click'])

// 'ghost'/'link' are always auto-sized to their text — never stretch them,
// even if a caller forgets to pass :full-width="false".
const isTextVariant = computed(() => props.variant === 'ghost' || props.variant === 'link')
const appliesFullWidth = computed(() => props.fullWidth && !isTextVariant.value)

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--full-width': appliesFullWidth },
    ]"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </button>
</template>
