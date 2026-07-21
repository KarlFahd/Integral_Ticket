<script setup>
import { computed } from 'vue'
import './BaseSearchInput.scss'
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: 'Search...',
  },

  // 'sm' (compact, inline in a card header — e.g. conversation search) |
  // 'md' (44px — table/list filter bars) | 'lg' (48px, default — main page filter bars)
  size: {
    type: String,
    default: 'lg',
  },

  // Shows a built-in "✕" button once there's text, which clears the field.
  // Off by default so pages that don't currently have a clear button don't gain one.
  clearable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const ICON_SIZE = { sm: 13, md: 16, lg: 18 }
const iconSize = computed(() => ICON_SIZE[props.size] ?? ICON_SIZE.lg)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const clear = () => emit('update:modelValue', '')
</script>

<template>
  <div :class="['base-search-input', `base-search-input--${size}`]">
    <Search :size="iconSize" class="base-search-input__icon" />

    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="base-search-input__field"
      @input="handleInput"
    />

    <slot name="suffix" />

    <button
      v-if="clearable && modelValue"
      type="button"
      class="base-search-input__clear"
      @click="clear"
    >
      <X :size="iconSize - 4" />
    </button>
  </div>
</template>
