<script setup>
import './BaseSelect.scss'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  // 'md' (44px — table/list filter bars) | 'lg' (48px, default — main page filter bars)
  size: {
    type: String,
    default: 'lg',
  },
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => emit('update:modelValue', event.target.value)
</script>

<template>
  <select
    :value="modelValue"
    :class="['base-select', `base-select--${size}`]"
    @change="handleChange"
  >
    <slot />
  </select>
</template>
