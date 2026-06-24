<script setup>
import './BaseButton.scss'

defineProps({
  text: {
    type: String,
    default: '',
  },

  type: {
    type: String,
    default: 'button',
  },

  variant: {
    type: String,
    default: 'primary',
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    :type="type"
    :class="['base-button', `base-button--${variant}`]"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </button>
</template>
